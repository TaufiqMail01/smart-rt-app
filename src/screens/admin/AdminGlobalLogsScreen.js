import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, RefreshControl } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminGlobalLogsScreen({ tenantCode }) {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil data gabungan dari berbagai aktivitas (Tamu, Aduan, Keuangan, dll)
  const fetchGlobalLogs = async () => {
    try {
      setLoading(true);

      // Ambil data buku tamu
      const { data: guests } = await supabase
        .from('guest_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM');

      // Ambil data aduan warga
      const { data: reports } = await supabase
        .from('reports')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM');

      // Format dan gabungkan data menjadi satu timeline aktivitas
      const formattedGuests = (guests || []).map(item => ({
        id: `guest-${item.id}`,
        title: `Tamu: ${item.guest_name} (${item.destination_house})`,
        detail: `Keperluan: ${item.purpose} | Plat: ${item.plat_number || '-'}`,
        category: 'KEAMANAN / TAMU',
        time: item.check_in,
        status: item.status
      }));

      const formattedReports = (reports || []).map(item => ({
        id: `report-${item.id}`,
        title: `Aduan Warga: ${item.title}`,
        detail: `Isi: ${item.description} | Pelapor: ${item.reporter_name || 'Warga'}`,
        category: 'ADUAN LINGKUNGAN',
        time: item.created_at,
        status: item.status
      }));

      // Gabungkan dan urutkan berdasarkan waktu terbaru
      const combined = [...formattedGuests, [...formattedReports]].flat().sort((a, b) => {
        return new Date(b.time) - new Date(a.time);
      });

      setAllLogs(combined);
    } catch (err) {
      console.error('Gagal memuat log global:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGlobalLogs();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGlobalLogs();
  };

  const renderLogItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.logCategory}>📌 {item.category}</Text>
        <Text style={styles.logTime}>{new Date(item.time).toLocaleString('id-ID')}</Text>
      </View>

      <Text style={styles.logTitle}>{item.title}</Text>
      <Text style={styles.logDetail}>{item.detail}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📊 Rekapitulasi Aktivitas Warga & Satpam</Text>
        <Text style={styles.headerSubtitle}>Semua catatan input dari pos jaga dan warga terpantau di sini.</Text>
      </View>

      <FlatList
        data={allLogs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada aktivitas tercatat di sistem.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  headerContainer: { padding: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#0B579D' },
  headerSubtitle: { fontSize: 11, color: '#64748B', marginTop: 2 },
  listContainer: { padding: 16 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  logCategory: { fontSize: 11, fontWeight: 'bold', color: '#0B579D' },
  logTime: { fontSize: 10, color: '#94A3B8' },
  logTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  logDetail: { fontSize: 12, color: '#334155' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13 }
});