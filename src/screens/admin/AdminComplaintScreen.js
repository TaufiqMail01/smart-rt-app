import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminComplaintScreen({ tenantCode }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil data aduan warga dari Supabase
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports') // Sesuaikan nama tabel aduan/laporan Anda (misal: 'reports' atau 'complaints')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error('Gagal memuat aduan:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  // Fungsi Mengubah Status Aduan (Menunggu -> Diproses -> Selesai)
  const handleUpdateStatus = async (id, currentStatus) => {
    let nextStatus = 'in_progress';
    let statusLabel = 'Diproses';

    if (currentStatus === 'pending' || currentStatus === 'menunggu') {
      nextStatus = 'in_progress';
      statusLabel = 'Diproses';
    } else if (currentStatus === 'in_progress' || currentStatus === 'diproses') {
      nextStatus = 'completed';
      statusLabel = 'Selesai';
    } else {
      nextStatus = 'pending';
      statusLabel = 'Menunggu';
    }

    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: nextStatus })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Sukses', `Status aduan diubah menjadi: ${statusLabel}`);
      fetchComplaints();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const renderComplaintItem = ({ item }) => {
    const status = item.status || 'pending';
    const isDone = status === 'completed' || status === 'selesai';
    const isInProgress = status === 'in_progress' || status === 'diproses';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.complaintTitle}>📢 {item.title || item.category || 'Aduan Warga'}</Text>
          <View style={[styles.badge, isDone ? styles.badgeDone : isInProgress ? styles.badgeProcess : styles.badgePending]}>
            <Text style={styles.badgeText}>
              {isDone ? 'SELESAI' : isInProgress ? 'DIPROSES' : 'MENUNGGU'}
            </Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>📝 <Text style={styles.bold}>Isi Laporan:</Text> {item.description || item.content}</Text>
        <Text style={styles.cardDetail}>👤 Pelapor: {item.reporter_name || item.user_name || 'Warga'}</Text>
        <Text style={styles.cardTime}>🕒 Tanggal: {new Date(item.created_at || Date.now()).toLocaleDateString('id-ID')}</Text>

        <TouchableOpacity 
          style={styles.btnAction} 
          onPress={() => handleUpdateStatus(item.id, status)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnActionText}>🔄 Ubah Status Penanganan</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>📢 Kelola Aduan & Aspirasi Warga</Text>
        <Text style={styles.headerSubtitle}>Pantau dan tindak lanjuti laporan lingkungan dari warga.</Text>
      </View>

      <FlatList
        data={complaints}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderComplaintItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada aduan atau laporan dari warga.</Text>
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
  complaintTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeProcess: { backgroundColor: '#E0F2FE' },
  badgeDone: { backgroundColor: '#DCFCE7' },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#1E293B' },
  cardDetail: { fontSize: 13, color: '#334155', marginBottom: 3 },
  bold: { fontWeight: '600', color: '#0F172A' },
  cardTime: { fontSize: 11, color: '#64748B', marginTop: 4, marginBottom: 10 },
  btnAction: { backgroundColor: '#0B579D', paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnActionText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 13, textAlign: 'center' }
});