import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';

export default function AdminDashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛡️ Panel Pengurus RT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Persetujuan Warga Baru (Pending)</Text>
          <View style={styles.userRow}>
            <View>
              <Text style={styles.userName}>Ahmad Fajar</Text>
              <Text style={styles.userBlock}>Blok B No. 04</Text>
            </View>
            <TouchableOpacity style={styles.approveBtn}>
              <Text style={styles.approveText}>Setujui</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Laporan Masuk Warga</Text>
          <Text style={styles.reportText}>• Lampu Jalan Blok A Mati (Pending)</Text>
          <Text style={styles.reportText}>• Sampah Belum Diangkut (Diproses)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  header: { backgroundColor: '#0B579D', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 18, marginBottom: 16, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  userRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { fontSize: 13, fontWeight: 'bold' },
  userBlock: { fontSize: 11, color: '#64748B' },
  approveBtn: { backgroundColor: '#0284C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  approveText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  reportText: { fontSize: 12, color: '#475569', marginBottom: 6 },
});