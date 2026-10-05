import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, Alert, ScrollView, RefreshControl } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminFinanceScreen({ tenantCode }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Form Tambah Transaksi
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('IN'); // 'IN' untuk Kas Masuk, 'OUT' untuk Kas Keluar
  const [description, setDescription] = useState('');

  // Hitung Saldo Total
  const totalBalance = transactions.reduce((acc, curr) => {
    return curr.type === 'IN' ? acc + Number(curr.amount) : acc - Number(curr.amount);
  }, 0);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('finance_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Gagal memuat keuangan:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  // Fungsi Tambah Transaksi Kas
  const handleAddTransaction = async () => {
    if (!title.trim() || !amount.trim()) {
      Alert.alert('Perhatian', 'Judul transaksi dan nominal wajib diisi!');
      return;
    }

    try {
      const { error } = await supabase.from('finance_logs').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          title: title.trim(),
          amount: parseFloat(amount),
          type: type, // 'IN' or 'OUT'
          description: description.trim(),
          created_at: new Date()
        }
      ]);

      if (error) throw error;

      Alert.alert('Sukses', 'Catatan keuangan berhasil ditambahkan.');
      setTitle('');
      setAmount('');
      setDescription('');
      fetchTransactions();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const renderTransactionItem = ({ item }) => {
    const isIncome = item.type === 'IN';
    return (
      <View style={styles.card}>
        <View style={styles.cardLeft}>
          <Text style={styles.transTitle}>{item.title}</Text>
          <Text style={styles.transDesc}>{item.description || 'Tanpa keterangan'}</Text>
          <Text style={styles.transDate}>{new Date(item.created_at).toLocaleDateString('id-ID')}</Text>
        </View>
        <Text style={[styles.transAmount, isIncome ? styles.textIncome : styles.textExpense]}>
          {isIncome ? '+ Rp ' : '- Rp '}
          {Number(item.amount).toLocaleString('id-ID')}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Ringkasan Saldo Kas RT */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>💰 Total Saldo Kas RT</Text>
          <Text style={styles.balanceAmount}>Rp {totalBalance.toLocaleString('id-ID')}</Text>
        </View>

        {/* Form Tambah Kas */}
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>➕ Catat Kas Masuk / Keluar</Text>

          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[styles.typeBtn, type === 'IN' && styles.typeInActive]}
              onPress={() => setType('IN')}
            >
              <Text style={[styles.typeText, type === 'IN' && styles.typeTextActive]}>Kas Masuk (Iuran)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.typeBtn, type === 'OUT' && styles.typeOutActive]}
              onPress={() => setType('OUT')}
            >
              <Text style={[styles.typeText, type === 'OUT' && styles.typeTextActive]}>Kas Keluar (Pengeluaran)</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Judul / Keterangan Singkat *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Iuran Warga Blok A / Beli Lampu Jalan"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Nominal (Rp) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 50000"
            placeholderTextColor="#94A3B8"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Catatan Detail (Opsional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama pembayar atau rincian belanja"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.btnSubmit} onPress={handleAddTransaction} activeOpacity={0.8}>
            <Text style={styles.btnText}>Simpan Transaksi</Text>
          </TouchableOpacity>
        </View>

        {/* Riwayat Daftar Kas */}
        <Text style={styles.sectionTitleList}>📋 Riwayat Transaksi Kas</Text>
      </ScrollView>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransactionItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada riwayat transaksi keuangan.</Text>
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
  balanceCard: { backgroundColor: '#0B579D', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 16, elevation: 3 },
  balanceLabel: { color: '#E0F2FE', fontSize: 13, marginBottom: 4 },
  balanceAmount: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  formCard: { backgroundColor: '#FFFFFF', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  sectionTitleList: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', marginHorizontal: 16, marginBottom: 8 },
  typeContainer: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  typeBtn: { flex: 1, paddingVertical: 8, borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, alignItems: 'center', backgroundColor: '#F8FAFC' },
  typeInActive: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  typeOutActive: { backgroundColor: '#FEE2E2', borderColor: '#DC2626' },
  typeText: { fontSize: 12, fontWeight: 'bold', color: '#64748B' },
  typeTextActive: { color: '#0F172A' },
  label: { fontSize: 12, fontWeight: 'bold', color: '#334155', marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 13, backgroundColor: '#F8FAFC', color: '#1E293B' },
  btnSubmit: { backgroundColor: '#0B579D', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 30 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 1, borderWidth: 1, borderColor: '#E2E8F0' },
  cardLeft: { flex: 1, marginRight: 10 },
  transTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  transDesc: { fontSize: 12, color: '#64748B', marginTop: 2 },
  transDate: { fontSize: 10, color: '#94A3B8', marginTop: 4 },
  transAmount: { fontSize: 14, fontWeight: 'bold' },
  textIncome: { color: '#16A34A' },
  textExpense: { color: '#DC2626' },
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#94A3B8', fontSize: 12 }
});