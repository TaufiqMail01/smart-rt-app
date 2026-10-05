import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminLetterScreen({ tenantCode }) {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [residentName, setResidentName] = useState('');
  const [letterType, setLetterType] = useState('');
  const [purpose, setPurpose] = useState('');

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLetters(data || []);
    } catch (err) {
      console.error('Gagal memuat surat:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [tenantCode]);

  const handleAddLetter = async () => {
    if (!residentName.trim() || !letterType.trim()) {
      Alert.alert('Perhatian', 'Nama warga dan jenis surat wajib diisi!');
      return;
    }

    try {
      const { error } = await supabase.from('letters').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          resident_name: residentName.trim(),
          letter_type: letterType.trim(),
          purpose: purpose.trim() || '-',
          status: 'Disetujui Admin',
          created_at: new Date()
        }
      ]);

      if (error) throw error;
      Alert.alert('Sukses', 'Surat pengantar berhasil diterbitkan.');
      setResidentName('');
      setLetterType('');
      setPurpose('');
      fetchLetters();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('letters').delete().eq('id', id);
      if (error) throw error;
      fetchLetters();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📄 {item.letter_type}</Text>
      <Text style={styles.cardDetail}>👤 Warga: <Text style={styles.bold}>{item.resident_name}</Text></Text>
      <Text style={styles.cardDetail}>📝 Keperluan: {item.purpose}</Text>
      <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item.id)}>
        <Text style={styles.btnDeleteText}>Hapus Surat</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Buat Surat Pengantar</Text>
        <Text style={styles.label}>Nama Warga</Text>
        <TextInput style={styles.input} placeholder="Nama lengkap warga" placeholderTextColor="#94A3B8" value={residentName} onChangeText={setResidentName} />
        <Text style={styles.label}>Jenis Surat</Text>
        <TextInput style={styles.input} placeholder="Contoh: Surat Domisili / SKCK" placeholderTextColor="#94A3B8" value={letterType} onChangeText={setLetterType} />
        <Text style={styles.label}>Keperluan</Text>
        <TextInput style={styles.input} placeholder="Contoh: Keperluan administrasi bank" placeholderTextColor="#94A3B8" value={purpose} onChangeText={setPurpose} />
        <TouchableOpacity style={styles.btnSubmit} onPress={handleAddLetter}>
          <Text style={styles.btnText}>Terbitkan Surat</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={letters}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLetters} colors={['#0B579D']} />}
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