import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RondaScreen() {
  const scheduleList = [
    { id: '1', day: 'Senin Malam', officer: 'Budi, Joko, Andi', pos: 'Pos Utama RT 06' },
    { id: '2', day: 'Selasa Malam', officer: 'Slamet, Rian, Doni', pos: 'Pos Utama RT 06' },
    { id: '3', day: 'Rabu Malam', officer: 'Hendra, Agus, Eko', pos: 'Pos Utama RT 06' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      <View style={styles.headerFrame}>
        <Text style={styles.headerTitle}>Jadwal Ronda Malam</Text>
        <Text style={styles.headerSubtitle}>Keamanan & Ketertiban Lingkungan RT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🛡️ Petugas Piket Malam Ini</Text>
          <Text style={styles.infoOfficer}>Budi Santoso & Joko Widodo</Text>
          <Text style={styles.infoPos}>Lokasi: Pos Kamling Utama</Text>
        </View>

        <Text style={styles.sectionTitle}>Jadwal Mingguan Warga</Text>

        {scheduleList.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.cardDay}>{item.day}</Text>
            <Text style={styles.cardDetail}>Petugas: {item.officer}</Text>
            <Text style={styles.cardPos}>📍 {item.pos}</Text>
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
  infoCard: {
    backgroundColor: '#065F46',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
  },
  infoTitle: { fontSize: 14, color: '#A7F3D0', fontWeight: 'bold', marginBottom: 6 },
  infoOfficer: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  infoPos: { fontSize: 13, color: '#D1FAE5' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardDay: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  cardDetail: { fontSize: 14, color: '#475569', marginBottom: 4 },
  cardPos: { fontSize: 13, color: '#0B579D', fontWeight: '600' },
});