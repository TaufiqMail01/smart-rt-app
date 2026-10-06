import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReportScreen({ user, tenantCode }) {
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');

  const handleSubmitReport = () => {
    if (!reportTitle.trim() || !reportDesc.trim()) {
      Alert.alert('Peringatan', 'Judul dan isi laporan tidak boleh kosong.');
      return;
    }

    Alert.alert(
      '✨ Laporan Terkirim',
      'Laporan atau aspirasi Anda telah berhasil dikirimkan kepada Pengurus RT dan akan segera ditinjau.',
      [
        {
          text: 'OK',
          onPress: () => {
            setReportTitle('');
            setReportDesc('');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      {/* Header Halaman Laporan */}
      <View style={styles.headerFrame}>
        <Text style={styles.headerTitle}>Laporan & Aspirasi Warga</Text>
        <Text style={styles.headerSubtitle}>Wilayah: {tenantCode || 'RT006'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Buat Laporan Baru</Text>
          <Text style={styles.cardDesc}>
            Sampaikan pengaduan fasilitas umum, keamanan, atau usulan kegiatan lingkungan kepada pengurus RT.
          </Text>

          <Text style={styles.label}>Judul Laporan / Kendala:</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Lampu Jalan Mati di Blok B"
            placeholderTextColor="#94A3B8"
            value={reportTitle}
            onChangeText={setReportTitle}
          />

          <Text style={styles.label}>Detail Keterangan:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Jelaskan detail lokasi dan masalah secara lengkap..."
            placeholderTextColor="#94A3B8"
            value={reportDesc}
            onChangeText={setReportDesc}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.btnSubmit} onPress={handleSubmitReport} activeOpacity={0.8}>
            <Text style={styles.btnSubmitText}>KIRIM LAPORAN</Text>
          </TouchableOpacity>
        </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 6 },
  cardDesc: { fontSize: 13, color: '#64748B', lineHeight: 18, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 18,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  btnSubmit: {
    backgroundColor: '#0B579D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  btnSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
});