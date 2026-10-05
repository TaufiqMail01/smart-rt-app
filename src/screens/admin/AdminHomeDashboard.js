import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminHomeDashboard({ user, tenantCode, navigation }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeGuests: 0,
    totalBalance: 0,
    pendingReports: 0
  });
  const [loading, setLoading] = useState(true);

  // Ambil ringkasan data statistik untuk pengurus RT
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // 1. Hitung total warga
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_code', tenantCode || 'UMUM');

      // 2. Hitung tamu aktif di pos jaga
      const { count: guestCount } = await supabase
        .from('guest_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_code', tenantCode || 'UMUM')
        .eq('status', 'active');

      // 3. Ambil data keuangan untuk hitung saldo
      const { data: finances } = await supabase
        .from('finance_logs')
        .select('amount, type')
        .eq('tenant_code', tenantCode || 'UMUM');

      const balance = (finances || []).reduce((acc, curr) => {
        return curr.type === 'IN' ? acc + Number(curr.amount) : acc - Number(curr.amount);
      }, 0);

      // 4. Hitung aduan pending
      const { count: reportCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_code', tenantCode || 'UMUM')
        .eq('status', 'pending');

      setStats({
        totalUsers: userCount || 0,
        activeGuests: guestCount || 0,
        totalBalance: balance,
        pendingReports: reportCount || 0
      });
    } catch (err) {
      console.error('Gagal memuat statistik admin:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, [tenantCode]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardStats} colors={['#0B579D']} />}
      >
        {/* Sambutan Pengurus */}
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>Halo, {user?.name || 'Pengurus RT'} 👋</Text>
          <Text style={styles.welcomeSubtitle}>Panel Kontrol Utama Klaster {tenantCode || 'UMUM'}</Text>
        </View>

        {/* Kotak Statistik Cepat (Grid 2x2) */}
        <Text style={styles.sectionTitle}>Ringkasan Lingkungan RT</Text>
        <View style={styles.gridContainer}>
          
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Warga</Text>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statDesc}>Akun terdaftar</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tamu di Lokasi</Text>
            <Text style={styles.statValue}>{stats.activeGuests}</Text>
            <Text style={styles.statDesc}>Pos jaga aktif</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Saldo Kas RT</Text>
            <Text style={styles.statValueSmall}>Rp {stats.totalBalance.toLocaleString('id-ID')}</Text>
            <Text style={styles.statDesc}>Kas bersih</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Aduan Masuk</Text>
            <Text style={styles.statValue}>{stats.pendingReports}</Text>
            <Text style={styles.statDesc}>Perlu ditindaklanjuti</Text>
          </View>

        </View>

        {/* Informasi / Panduan Singkat Admin */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Pusat Kendali Pengurus</Text>
          <Text style={styles.infoText}>
            Gunakan menu navigasi di atas untuk mengelola data warga, mencatat keuangan kas, memantau keamanan pos jaga, menangani aduan, serta mengatur inventaris aset RT secara terpusat.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  scrollContent: { padding: 16 },
  welcomeCard: { backgroundColor: '#0B579D', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 3 },
  welcomeTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 12, color: '#E0F2FE' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 10 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: '48%', backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  statLabel: { fontSize: 11, fontWeight: 'bold', color: '#64748B', marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  statValueSmall: { fontSize: 18, fontWeight: 'bold', color: '#166534', marginBottom: 2 },
  statDesc: { fontSize: 10, color: '#94A3B8' },
  infoBox: { backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  infoTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  infoText: { fontSize: 12, color: '#475569', lineHeight: 18 }
});