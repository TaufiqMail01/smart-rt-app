import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Alert, ScrollView } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminAssetScreen({ tenantCode }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Form Tambah Aset Baru
  const [assetName, setAssetName] = useState('');
  const [totalUnit, setTotalUnit] = useState('');
  const [condition, setCondition] = useState('Baik');

  // Ambil data aset dari Supabase
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('rt_assets')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (err) {
      console.error('Gagal memuat aset:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  // Fungsi Tambah Aset
  const handleAddAsset = async () => {
    if (!assetName.trim() || !totalUnit.trim()) {
      Alert.alert('Perhatian', 'Nama aset dan jumlah unit wajib diisi!');
      return;
    }

    try {
      const { error } = await supabase.from('rt_assets').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          asset_name: assetName.trim(),
          total_unit: parseInt(totalUnit),
          available_unit: parseInt(totalUnit),
          condition: condition,
          created_at: new Date()
        }
      ]);

      if (error) throw error;

      Alert.alert('Sukses', 'Aset inventaris RT berhasil ditambahkan.');
      setAssetName('');
      setTotalUnit('');
      fetchAssets();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  // Fungsi Ubah Status Kondisi Aset
  const handleToggleCondition = async (id, currentCondition) => {
    const nextCondition = currentCondition === 'Baik' ? 'Perlu Perbaikan' : 'Baik';
    try {
      const { error } = await supabase
        .from('rt_assets')
        .update({ condition: nextCondition })
        .eq('id', id);

      if (error) throw error;
      fetchAssets();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  // Fungsi Hapus Aset
  const handleDeleteAsset = async (id) => {
    Alert.alert('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus aset ini dari daftar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('rt_assets').delete().eq('id', id);
            if (error) throw error;
            fetchAssets();
          } catch (err) {
            Alert.alert('Gagal', err.message);
          }
        }
      }
    ]);
  };

  const renderAssetItem = ({ item }) => {
    const isGood = item.condition === 'Baik';
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.assetTitle}>📦 {item.asset_name}</Text>
          <TouchableOpacity 
            style={[styles.badge, isGood ? styles.badgeGood : styles.badgeBad]}
            onPress={() => handleToggleCondition(item.id, item.condition)}
          >
            <Text style={styles.badgeText}>{item.condition}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardDetail}>📊 Total Unit: <Text style={styles.bold}>{item.total_unit}</Text></Text>
        <Text style={styles.cardDetail}>✅ Tersedia Dipinjam: <Text style={styles.bold}>{item.available_unit}</Text></Text>

        <TouchableOpacity 
          style={styles.btnDelete} 
          onPress={() => handleDeleteAsset(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.btnDeleteText}>🗑️ Hapus Aset</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Form Tambah Aset */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>➕ Tambah Inventaris Aset RT</Text>

          <Text style={styles.label}>Nama Barang / Aset *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Tenda Hajatan / Kursi Lipat / Sound System"
            placeholderTextColor="#94A3B8"
            value={assetName}
            onChangeText={setAssetName}
          />

          <Text style={styles.label}>Jumlah Total Unit *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 50"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={totalUnit}
            onChangeText={setTotalUnit}
          />

          <TouchableOpacity style={styles.btnSubmit} onPress={handleAddAsset} activeOpacity={0.8}>
            <Text style={styles.btnText}>Simpan Aset Baru</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitleList}>📋 Daftar Inventaris & Fasilitas RT</Text>
      </ScrollView>

      <FlatList
        data={assets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderAssetItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada data inventaris aset RT.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  scrollContent: { padding: 16 },
  formCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  sectionTitleList: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginHorizontal: 16, marginBottom: 8 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#F8FAFC', color: '#1E293B' },
  btnSubmit: { backgroundColor: '#0B579D', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  assetTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeGood: { backgroundColor: '#DCFCE7' },
  badgeBad: { backgroundColor: '#FEE2E2' },
  badgeText: { fontSize: 9, fontWeight: 'bold', color: '#166534' },
  cardDetail: { fontSize: 12, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#0F172A' },
  btnDelete: { backgroundColor: '#EF4444', paddingVertical: 6, borderRadius: 6, alignItems: 'center', marginTop: 10 },
  btnDeleteText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#94A3B8', fontSize: 12 }
});