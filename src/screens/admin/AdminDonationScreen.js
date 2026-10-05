import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminDonationScreen({ tenantCode }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [donorName, setDonorName] = useState('');
  const [amount, setAmount] = useState('');
  const [programTitle, setProgramTitle] = useState('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDonations(data || []);
    } catch (err) {
      console.error('Gagal memuat donasi:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [tenantCode]);

  const handleAddDonation = async () => {
    if (!donorName.trim() || !amount.trim()) {
      Alert.alert('Perhatian', 'Nama donatur dan nominal wajib diisi!');
      return;
    }

    try {
      const { error } = await supabase.from('donations').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          donor_name: donorName.trim(),
          amount: parseFloat(amount),
          program_title: programTitle.trim() || 'Dana Sosial RT',
          created_at: new Date()
        }
      ]);

      if (error) throw error;
      Alert.alert('Sukses', 'Pencatatan donasi berhasil disimpan.');
      setDonorName('');
      setAmount('');
      setProgramTitle('');
      fetchDonations();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('donations').delete().eq('id', id);
      if (error) throw error;
      fetchDonations();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🎁 {item.program_title}</Text>
      <Text style={styles.cardDetail}>👤 Donatur: <Text style={styles.bold}>{item.donor_name}</Text></Text>
      <Text style={styles.cardDetail}>💰 Nominal: <Text style={styles.bold}>Rp {Number(item.amount).toLocaleString('id-ID')}</Text></Text>
      <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
        <Text style={styles.btnDeleteText}>Hapus Data</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Catat Donasi Warga</Text>
        <Text style={styles.label}>Nama Donatur / Warga</Text>
        <TextInput style={styles.input} placeholder="Nama donatur" placeholderTextColor="#94A3B8" value={donorName} onChangeText={setDonorName} />
        <Text style={styles.label}>Program / Keterangan</Text>
        <TextInput style={styles.input} placeholder="Contoh: Sumbangan 17 Agustus" placeholderTextColor="#94A3B8" value={programTitle} onChangeText={setProgramTitle} />
        <Text style={styles.label}>Nominal (Rp)</Text>
        <TextInput style={styles.input} placeholder="100000" placeholderTextColor="#94A3B8" keyboardType="numeric" value={amount} onChangeText={setAmount} />
        <TouchableOpacity style={styles.btnSubmit} onPress={handleAddDonation}>
          <Text style={styles.btnText}>Simpan Donasi</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={donations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchDonations} colors={['#0B579D']} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  formCard: { backgroundColor: '#FFFFFF', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 2, marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, backgroundColor: '#F8FAFC', color: '#1E293B' },
  btnSubmit: { backgroundColor: '#0B579D', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  cardDetail: { fontSize: 11, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#0F172A' },
  btnDelete: { backgroundColor: '#EF4444', paddingVertical: 4, borderRadius: 4, alignItems: 'center', marginTop: 8 },
  btnDeleteText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }
});