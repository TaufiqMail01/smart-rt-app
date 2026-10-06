import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PengaturanRtScreen({ route, navigation }) {
  const { tenantCode } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerFrame}>
      <TouchableOpacity 
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('KetuaRtDashboard');
          }
        }} 
        style={styles.backBtn}
      >
        <Text style={styles.backText}>‹ Kembali</Text>
      </TouchableOpacity>
        <Text style={styles.headerTitle}>Informasi & Kode RT</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Kode Unik Wilayah Anda:</Text>
          <Text style={styles.codeText}>{tenantCode || 'RT006-RW012-KEDIP'}</Text>
          <Text style={styles.desc}>
            Bagikan kode di atas kepada warga lingkungan Anda agar mereka dapat memasukkannya pada menu pengaturan awal aplikasi.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  headerFrame: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  content: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  label: { fontSize: 15, color: '#64748B', fontWeight: 'bold', marginBottom: 12 },
  codeText: { fontSize: 22, fontWeight: 'bold', color: '#0B579D', marginBottom: 16, letterSpacing: 1 },
  desc: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 20 },
});