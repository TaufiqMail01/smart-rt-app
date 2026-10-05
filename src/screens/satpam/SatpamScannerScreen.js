import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, Alert, SafeAreaView, RefreshControl } from 'react-native';
import { supabase } from '../../config/supabase';

export default function SatpamScannerScreen({ user, tenantCode, navigation }) {
  // State untuk Navigasi Tab Internal (Form vs Riwayat)
  const [activeSubTab, setActiveSubTab] = useState('form');

  // State Form Input
  const [guestName, setGuestName] = useState('');
  const [destinationHouse, setDestinationHouse] = useState('');
  const [platNumber, setPlatNumber] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);

  // State Daftar Riwayat
  const [guestList, setGuestList] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Ambil Data Tamu dari Supabase
  const fetchGuestLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('guest_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('check_in', { ascending: false });

      if (error) throw error;
      setGuestList(data || []);
    } catch (err) {
      console.error('Gagal memuat riwayat:', err.message);
    } finally {
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

  // Fungsi Simpan Buku Tamu
  const handleSaveGuest = async () => {
    if (!guestName.trim() || !destinationHouse.trim() || !purpose.trim()) {
      Alert.alert('Perhatian', 'Nama tamu, rumah tujuan, dan keperluan wajib diisi!');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('guest_logs').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          guest_name: guestName.trim(),
          destination_house: destinationHouse.trim(),
          plat_number: platNumber.trim() ? platNumber.trim().toUpperCase() : '-',
          purpose: purpose.trim(),
          created_by: user?.name || 'Satpam',
          check_in: new Date(),
          status: 'active'
        },
      ]);

      if (error) throw error;

      Alert.alert('Berhasil', 'Data tamu pos jaga berhasil dicatat.');
      
      // Reset form & pindah ke tab riwayat untuk melihat hasil
      setGuestName('');
      setDestinationHouse('');
      setPlatNumber('');
      setPurpose('');
      fetchGuestLogs();
      setActiveSubTab('list');
    } catch (err) {
      Alert.alert('Gagal Menyimpan', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Check-out Tamu Keluar
  const handleCheckOut = async (id) => {
    try {
      const { error } = await supabase
        .from('guest_logs')
        .update({ status: 'completed', check_out: new Date() })
        .eq('id', id);

      if (error) throw error;
      
      Alert.alert('Sukses', 'Tamu telah dicatat keluar.');
      fetchGuestLogs();
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
      
      {/* Header Info Pos Jaga */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>🛡️ Pos Jaga & Buku Tamu RT</Text>
        <Text style={styles.headerSubtitle}>Kelola pencatatan dan pantau kunjungan tamu di lingkungan.</Text>
      </View>

      {/* Switcher Tab Internal (Form vs Riwayat) */}
      <View style={styles.subTabContainer}>
        <TouchableOpacity 
          style={[styles.subTabBtn, activeSubTab === 'form' && styles.subTabActive]}
          onPress={() => setActiveSubTab('form')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'form' && styles.subTextActive]}>➕ Input Buku Tamu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.subTabBtn, activeSubTab === 'list' && styles.subTabActive]}
          onPress={() => setActiveSubTab('list')}
        >
          <Text style={[styles.subTabText, activeSubTab === 'list' && styles.subTextActive]}>📋 Daftar Kunjungan</Text>
        </TouchableOpacity>
      </View>

      {/* Konten Berdasarkan Tab Aktif */}
      {activeSubTab === 'form' ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>📝 Formulir Masuk Tamu</Text>

            <Text style={styles.label}>Nama Tamu Lengkap *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Budi Santoso"
              placeholderTextColor="#94A3B8"
              value={guestName}
              onChangeText={setGuestName}
            />

            <Text style={styles.label}>Rumah / Warga yang Dituju *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Blok A No. 15"
              placeholderTextColor="#94A3B8"
              value={destinationHouse}
              onChangeText={setDestinationHouse}
            />

            <Text style={styles.label}>Nomor Kendaraan (Plat Nomor)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: B 1234 XYZ (Opsional)"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              value={platNumber}
              onChangeText={setPlatNumber}
            />

            <Text style={styles.label}>Keperluan Kunjungan *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Contoh: Tamu Keluarga / Kurir Paket"
              placeholderTextColor="#94A3B8"
              multiline={true}
              numberOfLines={3}
              value={purpose}
              onChangeText={setPurpose}
            />

            <TouchableOpacity 
              style={[styles.btnSubmit, loading && styles.btnDisabled]} 
              onPress={handleSaveGuest}
              activeOpacity={0.8}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? 'Menyimpan...' : '💾 Simpan Buku Tamu'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={guestList}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderGuestItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada data buku tamu yang tercatat.</Text>
            </View>
          }
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  headerCard: { backgroundColor: '#0B579D', padding: 14, margin: 16, marginBottom: 8, borderRadius: 12, elevation: 3 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 2 },
  headerSubtitle: { fontSize: 11, color: '#E0F2FE' },
  subTabContainer: { flexDirection: 'row', backgroundColor: '#E2E8F0', marginHorizontal: 16, marginBottom: 12, borderRadius: 8, padding: 3 },
  subTabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  subTabActive: { backgroundColor: '#FFFFFF', elevation: 2 },
  subTabText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  subTextActive: { color: '#0B579D' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 30 },
  formCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#F8FAFC', color: '#1E293B' },
  textArea: { height: 70, textAlignVertical: 'top' },
  btnSubmit: { backgroundColor: '#0B579D', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 18 },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 10, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardInactive: { backgroundColor: '#F8FAFC', opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  guestName: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeActive: { backgroundColor: '#DCFCE7' },
  badgeDone: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#166534' },
  cardDetail: { fontSize: 12, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#0F172A' },
  cardTime: { fontSize: 10, color: '#64748B', marginTop: 2, marginBottom: 8 },
  btnCheckOut: { backgroundColor: '#EF4444', paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  btnCheckOutText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 12 }
});