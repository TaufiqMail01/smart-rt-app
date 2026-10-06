import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FinanceScreen({ user }) {
  const isTreasurer = user?.role === 'bendahara' || user?.role === 'ketua_rt' || user?.role === 'super_admin';

  const transactionList = [
    { id: '1', title: 'Iuran Wajib Bulanan - Blok A 05', type: 'IN', amount: '+ Rp 50.000', date: '05 Okt 2026' },
    { id: '2', title: 'Pembelian Lampu Pos Ronda', type: 'OUT', amount: '- Rp 25.000', date: '04 Okt 2026' },
    { id: '3', title: 'Iuran Wajib Bulanan - Blok B 12', type: 'IN', amount: '+ Rp 50.000', date: '02 Okt 2026' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      <View style={styles.headerFrame}>
        <Text style={styles.headerTitle}>Kas & Keuangan RT</Text>
        <Text style={styles.headerSubtitle}>
          {isTreasurer ? 'Mode Kelola & Pencatatan Kas' : 'Transparansi Keuangan Warga'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ringkasan Saldo */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Saldo Kas RT</Text>
          <Text style={styles.balanceValue}>Rp 2.450.000</Text>
          <Text style={styles.balanceDesc}>🟢 Keuangan aktif dan transparan</Text>
        </View>

        <Text style={styles.sectionTitle}>Riwayat Transaksi Terakhir</Text>

        {transactionList.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.txTitle}>{item.title}</Text>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <Text style={[styles.txAmount, item.type === 'IN' ? styles.textIn : styles.textOut]}>
              {item.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  headerFrame: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#BAE6FD', marginTop: 2, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  balanceCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    elevation: 3,
  },
  balanceLabel: { fontSize: 13, color: '#94A3B8', fontWeight: 'bold', marginBottom: 6 },
  balanceValue: { fontSize: 26, fontWeight: 'bold', color: '#38BDF8', marginBottom: 6 },
  balanceDesc: { fontSize: 13, color: '#34D399', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  txTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#64748B' },
  txAmount: { fontSize: 15, fontWeight: 'bold' },
  textIn: { color: '#059669' },
  textOut: { color: '#DC2626' },
});