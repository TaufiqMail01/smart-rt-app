import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, Alert, RefreshControl } from 'react-native';
import { supabase } from '../../config/supabase';

export default function GuestLogListScreen({ user, tenantCode }) {
  const [guestList, setGuestList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fungsi untuk mengambil data buku tamu dari Supabase
  const fetchGuestLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guest_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('check_in', { ascending: false }); // Urutkan dari yang terbaru

      if (error) throw error;
      setGuestList(data || []);
    } catch (err) {
      Alert.alert('Error', 'Gagal memuat data buku tamu: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuestLogs();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuestLogs();
  };

  // Fungsi untuk mengubah status tamu menjadi selesai / sudah keluar (Check-out)
  const handleCheckOut = async (id) => {
    try {
      const { error } = await supabase
        .from('guest_logs')
        .update({ status: 'completed', check_out: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      Alert.alert('Sukses', 'Tamu telah dicatat keluar (Check-out).');
      fetchGuestLogs(); // Refresh data otomatis
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const renderGuestItem = ({ item }) => {
    const isActive = item.status === 'active';
    
    return (
      <View style={[styles.card, !isActive && styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <Text style={styles.guestName}>👤 {item.guest_name}</Text>
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeDone]}>
            <Text style={styles.badgeText}>{isActive ? 'DI LOKASI' : 'SELESAI'}</Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>🏠 Tujuan: <Text style={styles.bold}>{item.destination_house}</Text></Text>
        <Text style={styles.cardDetail}>🚗 Kendaraan: <Text style={styles.bold}>{item.plat_number || '-'}</Text></Text>
        <Text style={styles.cardDetail}>📝 Keperluan: {item.purpose}</Text>
        <Text style={styles.cardTime}>🕒 Masuk: {new Date(item.check_in).toLocaleString('id-ID')}</Text>

        {isActive && (
          <TouchableOpacity 
            style={styles.btnCheckOut} 
            onPress={() => handleCheckOut(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.btnCheckOutText}>🚪 Catat Tamu Keluar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📋 Riwayat Buku Tamu Pos Jaga</Text>
        <Text style={styles.headerSubtitle}>Daftar seluruh tamu masuk dan kendaraan di lingkungan RT.</Text>
      </View>

      <FlatList
        data={guestList}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGuestItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada data buku tamu yang tercatat.</Text>
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
  cardInactive: { backgroundColor: '#F8FAFC', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  guestName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeDone: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: '#166534' },
  cardDetail: { fontSize: 13, color: '#334155', marginBottom: 3 },
  bold: { fontWeight: '600', color: '#0F172A' },
  cardTime: { fontSize: 11, color: '#64748B', marginTop: 4, marginBottom: 10 },
  btnCheckOut: { backgroundColor: '#EF4444', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnCheckOutText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13 }
});