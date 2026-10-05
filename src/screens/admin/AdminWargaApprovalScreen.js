import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminWargaApprovalScreen({ tenantCode }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Form Pendaftaran Warga oleh Admin
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('warga'); // 'warga' atau 'satpam'

  // Ambil daftar warga/pengguna di klaster ini
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Gagal memuat data warga:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  // Fungsi Admin Mendaftarkan Warga / Akun Baru
  const handleRegisterUser = async () => {
    if (!name.trim() || !email.trim() || !address.trim()) {
      Alert.alert('Perhatian', 'Nama, email/username, dan alamat rumah wajib diisi!');
      return;
    }

    try {
      const { error } = await supabase.from('users').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          address: address.trim(),
          phone: phone.trim() || '-',
          role: role,
          is_approved: true, // Langsung disetujui karena didaftarkan oleh admin
          created_at: new Date()
        }
      ]);

      if (error) throw error;

      Alert.alert('Sukses', 'Data warga/petugas berhasil didaftarkan oleh Admin.');
      setName('');
      setEmail('');
      setAddress('');
      setPhone('');
      fetchUsers();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  // Fungsi Hapus Akun oleh Admin
  const handleDeleteUser = async (userId) => {
    Alert.alert('Konfirmasi Hapus', 'Apakah Anda yakin ingin menghapus akses pengguna ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) throw error;
            fetchUsers();
          } catch (err) {
            Alert.alert('Gagal', err.message);
          }
        }
      }
    ]);
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.userName}>👤 {item.name}</Text>
        <Text style={styles.cardDetail}>🏠 Alamat/Blok: <Text style={styles.bold}>{item.address || '-'}</Text></Text>
        <Text style={styles.cardDetail}>📞 No. HP: {item.phone || '-'}</Text>
        <Text style={styles.cardDetail}>🏷️ Peran: <Text style={styles.bold}>{item.role.toUpperCase()}</Text></Text>
      </View>

      <TouchableOpacity 
        style={styles.btnDelete} 
        onPress={() => handleDeleteUser(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.btnDeleteText}>🗑️ Hapus Akses</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Form Pendaftaran Warga oleh Admin */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>➕ Daftarkan Warga / Satpam Baru</Text>

          <Text style={styles.label}>Nama Lengkap *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Ahmad Fauzi"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Email / Username Login *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: ahmad@warga.com"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Blok / Alamat Rumah *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Blok B No. 12"
            placeholderTextColor="#94A3B8"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>Nomor WhatsApp / HP</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 081234567890"
            placeholderTextColor="#94A3B8"
            keyboardDataType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <Text style={styles.label}>Pilih Peran (Role)</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity 
              style={[styles.roleBtn, role === 'warga' && styles.roleActive]}
              onPress={() => setRole('warga')}
            >
              <Text style={[styles.roleText, role === 'warga' && styles.roleTextActive]}>Warga</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.roleBtn, role === 'satpam' && styles.roleActive]}
              onPress={() => setRole('satpam')}
            >
              <Text style={[styles.roleText, role === 'satpam' && styles.roleTextActive]}>Satpam</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnSubmit} onPress={handleRegisterUser} activeOpacity={0.8}>
            <Text style={styles.btnText}>Daftarkan Akun</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitleList}>📋 Daftar Warga & Petugas Terdaftar</Text>
      </ScrollView>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada data warga yang didaftarkan.</Text>
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
  roleContainer: { flexDirection: 'row', gap: 8, marginTop: 4, marginBottom: 8 },
  roleBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, alignItems: 'center', backgroundColor: '#F8FAFC' },
  roleActive: { backgroundColor: '#0B579D', borderColor: '#0B579D' },
  roleText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  roleTextActive: { color: '#FFFFFF' },
  btnSubmit: { backgroundColor: '#0B579D', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 10, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardInfo: { marginBottom: 8 },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  cardDetail: { fontSize: 12, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#0F172A' },
  btnDelete: { backgroundColor: '#EF4444', paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  btnDeleteText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#94A3B8', fontSize: 12 }
});