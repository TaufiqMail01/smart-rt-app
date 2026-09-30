import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function FinanceScreen() {
  const handlePayNow = () => {
    Alert.alert(
      'Pembayaran Iuran',
      'Pilih metode pembayaran (QRIS / Transfer Bank / E-Wallet)',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Bayar via QRIS', onPress: () => Alert.alert('Sukses', 'Menampilkan kode QRIS...') },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Keuangan & Kas RT</Text>
          <Text style={styles.subtitle}>Transparansi pembayaran dan laporan kas warga</Text>
        </View>

        {/* Card Ringkasan Kas RT (Transparansi Publik) */}
        <View style={styles.kasCard}>
          <Text style={styles.kasLabel}>TOTAL KAS RT 05</Text>
          <Text style={styles.kasValue}>Rp 14.850.000</Text>
          <View style={styles.kasDivider} />
          <View style={styles.kasDetailRow}>
            <View>
              <Text style={styles.kasSubLabel}>Pemasukan Bulan Ini</Text>
              <Text style={styles.kasInText}>+ Rp 2.500.000</Text>
            </View>
            <View>
              <Text style={styles.kasSubLabel}>Pengeluaran Bulan Ini</Text>
              <Text style={styles.kasOutText}>- Rp 850.000</Text>
            </View>
          </View>
        </View>

        {/* Status Tagihan Warga */}
        <Text style={styles.sectionTitle}>TAGIHAN SAYA</Text>
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <View>
              <Text style={styles.billMonth}>Iuran September 2026</Text>
              <Text style={styles.billSub}>Kebersihan, Keamanan & Kas</Text>
            </View>
            <View style={styles.statusUnpaid}>
              <Text style={styles.statusUnpaidText}>Belum Bayar</Text>
            </View>
          </View>
          
          <View style={styles.billAmountRow}>
            <Text style={styles.billAmountLabel}>Total Tagihan:</Text>
            <Text style={styles.billAmountValue}>Rp 50.000</Text>
          </View>

          <TouchableOpacity style={styles.payButton} onPress={handlePayNow}>
            <Text style={styles.payButtonText}>Bayar Sekarang (QRIS)</Text>
          </TouchableOpacity>
        </View>

        {/* Riwayat Transaksi Kas RT */}
        <Text style={styles.sectionTitle}>RIWAYAT KAS RT TERAKHIR</Text>
        <View style={styles.historyContainer}>
          <View style={styles.historyItem}>
            <View style={[styles.historyIconBg, styles.bgOut]}>
              <Text style={styles.historyIcon}>🛠️</Text>
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyTitle}>Perbaikan Lampu Jalan</Text>
              <Text style={styles.historyDate}>25 Sep 2026</Text>
            </View>
            <Text style={styles.historyAmountOut}>- Rp 250.000</Text>
          </View>

          <View style={styles.historyItem}>
            <View style={[styles.historyIconBg, styles.bgIn]}>
              <Text style={styles.historyIcon}>📥</Text>
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyTitle}>Iuran Warga (15 Rumah)</Text>
              <Text style={styles.historyDate}>20 Sep 2026</Text>
            </View>
            <Text style={styles.historyAmountIn}>+ Rp 750.000</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  kasCard: {
    backgroundColor: '#0284C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  kasLabel: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  kasValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  kasDivider: {
    height: 1,
    backgroundColor: '#38BDF8',
    marginVertical: 12,
  },
  kasDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kasSubLabel: {
    color: '#E0F2FE',
    fontSize: 11,
  },
  kasInText: {
    color: '#4ADE80',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
  },
  kasOutText: {
    color: '#FCA5A5',
    fontWeight: 'bold',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 12,
  },
  billCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  billMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  billSub: {
    fontSize: 12,
    color: '#A0AEC0',
    marginTop: 2,
  },
  statusUnpaid: {
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FEB2B2',
  },
  statusUnpaidText: {
    color: '#E53E3E',
    fontSize: 11,
    fontWeight: 'bold',
  },
  billAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  billAmountLabel: {
    fontSize: 13,
    color: '#718096',
  },
  billAmountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  payButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  historyIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bgOut: {
    backgroundColor: '#FFF5F5',
  },
  bgIn: {
    backgroundColor: '#F0FDF4',
  },
  historyIcon: {
    fontSize: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
  },
  historyDate: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
  },
  historyAmountOut: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E53E3E',
  },
  historyAmountIn: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#16A34A',
  },
});