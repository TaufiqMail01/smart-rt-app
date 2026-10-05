import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminSecurityScreen({ tenantCode }) {
  const [activeGuests, setActiveGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil data tamu yang masih aktif di dalam lingkungan RT
  const fetchActiveGuests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guest_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .eq('status', 'active')
        .order('check_in', { ascending: false });

      if (error) throw error;
      setActiveGuests(data || []);
    } catch (err) {
      console.error('Gagal memuat data keamanan:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveGuests();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActiveGuests();
  };

  const renderGuestItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.guestName}>👤 {item.guest_name}</Text>
        <View style={styles.badgeActive}>
          <Text style={styles.badgeText}>DI LOKASI</Text>
        </View>
      </View>

      <Text style={styles.cardDetail}>🏠 Tujuan: <Text style={styles.bold}>{item.destination_house}</Text></Text>
      <Text style={styles.cardDetail}>🚗 Kendaraan: <Text style={styles.bold}>{item.plat_number || '-'}</Text></Text>
      <Text style={styles.cardDetail}>📝 Keperluan: {item.purpose}</Text>
      <Text style={styles.cardDetail}>🛡️ Dicatat oleh: {item.created_by || 'Satpam'}</Text>
      <Text style={styles.cardTime}>🕒 Masuk: {new Date(item.check_in).toLocaleString('id-ID')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>🛡️ Pantau Keamanan & Tamu Aktif</Text>
        <Text style={styles.headerSubtitle}>Daftar tamu yang sedang berada di dalam lingkungan RT saat ini.</Text>
      </View>

      <FlatList
        data={activeGuests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGuestItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada tamu aktif di dalam lingkungan saat ini.</Text>
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
  guestName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  badgeActive: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  cardDetail: { fontSize: 13, color: '#334155', marginBottom: 3 },
  bold: { fontWeight: '600', color: '#0F172A' },
  cardTime: { fontSize: 11, color: '#64748B', marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13, textAlign: 'center' }
});