import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Alert, Modal } from 'react-native';
import { supabase } from '../../config/supabase';

export default function GuestLogListScreen({ tenantCode, user }) {
  const [guestLogs, setGuestLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'done'

  // State untuk Modal Formulir Input Satpam (Plat nomor dipecah menjadi 3 bagian)
  const [modalVisible, setModalVisible] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [destinationHouse, setDestinationHouse] = useState('');
  const [platPart1, setPlatPart1] = useState('');
  const [platPart2, setPlatPart2] = useState('');
  const [platPart3, setPlatPart3] = useState('');
  const [purpose, setPurpose] = useState('');

  const fetchGuestLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('guest_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('check_in', { ascending: false });

      if (error) throw error;
      setGuestLogs(data || []);
      setFilteredLogs(data || []);
    } catch (err) {
      console.error('Gagal memuat riwayat buku tamu:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchGuestLogs();
  }, [tenantCode]);

  useEffect(() => {
    let result = guestLogs;

    if (filterStatus === 'active') {
      result = result.filter(item => item.status === 'active');
    } else if (filterStatus === 'done') {
      result = result.filter(item => item.status === 'done');
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.guest_name && item.guest_name.toLowerCase().includes(q)) ||
        (item.destination_house && item.destination_house.toLowerCase().includes(q)) ||
        (item.plat_number && item.plat_number.toLowerCase().includes(q))
      );
    }

    setFilteredLogs(result);
  }, [searchQuery, filterStatus, guestLogs]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGuestLogs();
  };

  const handleCheckIn = async () => {
    if (!guestName.trim() || !destinationHouse.trim()) {
      Alert.alert('Perhatian', 'Nama tamu dan rumah tujuan wajib diisi!');
      return;
    }

    const combinedPlat = [platPart1.trim(), platPart2.trim(), platPart3.trim()]
      .filter(Boolean)
      .join(' ') || '-';

    try {
      const { error } = await supabase.from('guest_logs').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          guest_name: guestName.trim(),
          destination_house: destinationHouse.trim(),
          plat_number: combinedPlat,
          purpose: purpose.trim() || 'Kunjungan',
          status: 'active',
          created_by: user?.name || 'Satpam Pos',
          check_in: new Date()
        }
      ]);

      if (error) throw error;

      Alert.alert('Sukses', 'Data tamu berhasil dicatat ke sistem.');
      setGuestName('');
      setDestinationHouse('');
      setPlatPart1('');
      setPlatPart2('');
      setPlatPart3('');
      setPurpose('');
      setModalVisible(false);
      fetchGuestLogs();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const handleCheckOut = async (id) => {
    try {
      const { error } = await supabase
        .from('guest_logs')
        .update({ status: 'done' })
        .eq('id', id);

      if (error) throw error;
      fetchGuestLogs();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const activeCount = guestLogs.filter(item => item.status === 'active').length;

  const renderGuestItem = ({ item }) => {
    const isActive = item.status === 'active';
    return (
      <View style={[styles.card, !isActive && styles.cardInactive]}>
        <View style={styles.cardHeader}>
          <Text style={styles.guestName}>👤 {item.guest_name}</Text>
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeDone]}>
            <Text style={styles.badgeText}>{isActive ? 'DI LOKASI' : 'KELUAR'}</Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>🏠 Rumah Tujuan: <Text style={styles.bold}>{item.destination_house}</Text></Text>
        <Text style={styles.cardDetail}>🚗 No. Kendaraan: <Text style={styles.bold}>{item.plat_number || '-'}</Text></Text>
        <Text style={styles.cardDetail}>📝 Keperluan: {item.purpose}</Text>
        <Text style={styles.cardDetail}>🛡️ Dicatat Oleh: {item.created_by || 'Satpam'}</Text>
        <Text style={styles.cardTime}>🕒 Masuk: {new Date(item.check_in).toLocaleString('id-ID')}</Text>

        {isActive && (
          <TouchableOpacity style={styles.btnCheckOut} onPress={() => handleCheckOut(item.id)} activeOpacity={0.8}>
            <Text style={styles.btnCheckOutText}>Tandai Tamu Keluar</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Banner Atas */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerBannerBadge}>BUKU POS JAGA DETAIL</Text>
        <Text style={styles.headerTitle}>Monitoring Tamu & Kendaraan</Text>
        <Text style={styles.headerSubtitle}>Klaster: {tenantCode || 'UMUM'} | Tamu Aktif: {activeCount} Orang</Text>
      </View>

      <FlatList
        data={filteredLogs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderGuestItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListHeaderComponent={
          <View>
            {/* Tombol Utama Satpam */}
            <TouchableOpacity 
              style={styles.btnAddGuestMain} 
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAddGuestMainText}>Catat Tamu / Kurir Masuk Baru</Text>
            </TouchableOpacity>
            {/* Kolom Pencarian */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="🔍 Cari nama tamu, plat nomor, / blok..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Tombol Filter Status */}
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={[styles.filterBtn, filterStatus === 'all' && styles.filterBtnActive]}
                onPress={() => setFilterStatus('all')}
              >
                <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>Semua</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterBtn, filterStatus === 'active' && styles.filterBtnActive]}
                onPress={() => setFilterStatus('active')}
              >
                <Text style={[styles.filterText, filterStatus === 'active' && styles.filterTextActive]}>Di Lokasi</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.filterBtn, filterStatus === 'done' && styles.filterBtnActive]}
                onPress={() => setFilterStatus('done')}
              >
                <Text style={[styles.filterText, filterStatus === 'done' && styles.filterTextActive]}>Keluar</Text>
              </TouchableOpacity>
            </View>

            {/* Bingkai Judul Daftar */}
            <View style={styles.historyTitleBox}>
              <Text style={styles.historySectionHeader}>📋 Riwayat Buku Tamu Pos Jaga ({filteredLogs.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Tidak ada data tamu yang ditemukan.</Text>
            </View>
          )
        }
      />

      {/* Modal Form Input Tamu Masuk */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📝 Formulir Catat Masuk Tamu</Text>
            <Text style={styles.modalSubtitle}>Masukkan identitas tamu atau kurir yang masuk ke klaster.</Text>

            <Text style={styles.label}>Nama Tamu / Kurir *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Budi Santoso"
              placeholderTextColor="#94A3B8"
              value={guestName}
              onChangeText={setGuestName}
            />

            <Text style={styles.label}>Rumah Tujuan / Blok *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Blok A No. 5"
              placeholderTextColor="#94A3B8"
              value={destinationHouse}
              onChangeText={setDestinationHouse}
            />

            <Text style={styles.label}>Nomor Plat Kendaraan (3 Bagian)</Text>
            <View style={styles.platRowContainer}>
              <TextInput
                style={[styles.input, styles.platBox1]}
                placeholder="B"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={3}
                value={platPart1}
                onChangeText={setPlatPart1}
              />
              <TextInput
                style={[styles.input, styles.platBox2]}
                placeholder="1234"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={4}
                value={platPart2}
                onChangeText={setPlatPart2}
              />
              <TextInput
                style={[styles.input, styles.platBox3]}
                placeholder="XYZ"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                maxLength={4}
                value={platPart3}
                onChangeText={setPlatPart3}
              />
            </View>

            <Text style={styles.label}>Keperluan / Keterangan</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Bertamu / Antar Paket"
              placeholderTextColor="#94A3B8"
              value={purpose}
              onChangeText={setPurpose}
            />

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={styles.btnCancel} 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnSubmit} 
                onPress={handleCheckIn}
                activeOpacity={0.8}
              >
                <Text style={styles.btnSubmitText}>Simpan & Catat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA' 
  },
  headerBanner: { 
    backgroundColor: '#0B579D', 
    padding: 22, 
    marginHorizontal: 16,
    marginTop: 32, 
    borderRadius: 14, 
    elevation: 3 
  },
  headerBannerBadge: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#93C5FD', 
    marginBottom: 6, 
    letterSpacing: 1 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 6 
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: '#E0F2FE',
    fontWeight: '600' 
  },
  listContainer: { 
    padding: 16,
    paddingTop: 12,
    paddingBottom: 30 
  },
  btnAddGuestMain: {
    backgroundColor: '#166534',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  btnAddGuestMainText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
    elevation: 1,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  filterBtnActive: {
    backgroundColor: '#0B579D',
    borderColor: '#0B579D',
  },
  filterText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  historyTitleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    elevation: 1,
    alignItems: 'center'
  },
  historySectionHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0B579D', 
    letterSpacing: 0.5
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 14, 
    padding: 18, 
    marginBottom: 14, 
    elevation: 2, 
    borderWidth: 1.5, 
    borderColor: '#CBD5E1' 
  },
  cardInactive: { 
    backgroundColor: '#F8FAFC', 
    opacity: 0.85 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  guestName: { 
    fontSize: 19, 
    fontWeight: 'bold', 
    color: '#1E293B' 
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  badgeActive: { 
    backgroundColor: '#DCFCE7' 
  },
  badgeDone: { 
    backgroundColor: '#F1F5F9' 
  },
  badgeText: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#166534' 
  },
  cardDetail: { 
    fontSize: 16, 
    color: '#334155', 
    marginBottom: 8,
    fontWeight: '500'
  },
  bold: { 
    fontWeight: 'bold', 
    color: '#0F172A' 
  },
  cardTime: { 
    fontSize: 14, 
    color: '#64748B', 
    marginTop: 6, 
    marginBottom: 14,
    fontWeight: '600' 
  },
  btnCheckOut: { 
    backgroundColor: '#EF4444', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center' 
  },
  btnCheckOutText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 40 
  },
  emptyText: { 
    color: '#94A3B8', 
    fontSize: 16,
    fontWeight: '600' 
  },
  // Gaya untuk Modal Pop-up Formulir
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748B',
    marginBottom: 18,
    fontWeight: '500',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontWeight: '600',
  },
  platRowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  platBox1: {
    flex: 1,
    marginRight: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  platBox2: {
    flex: 2,
    marginRight: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  platBox3: {
    flex: 1.5,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#64748B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  btnCancelText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#0B579D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});