import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function ReportScreen() {
  const [category, setCategory] = useState('Fasilitas Rusak');
  const [description, setDescription] = useState('');

  const handleSubmitReport = () => {
    if (!description.trim()) {
      Alert.alert('Peringatan', 'Silakan isi deskripsi laporan/aduan Anda.');
      return;
    }
    Alert.alert('Sukses', 'Laporan Anda telah terkirim dan sedang ditinjau oleh Pengurus RT!');
    setDescription('');
  };

  const handlePanicButton = () => {
    Alert.alert(
      '🚨 KONFIRMASI DARURAT',
      'Kirim sinyal darurat (SOS) beserta lokasi rumah Anda ke Pos Satpam dan Pengurus RT?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'KIRIM SOS',
          style: 'destructive',
          onPress: () => Alert.alert('TERKIRIM', 'Sinyal darurat telah dikirim ke Pos Satpam!'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Aduan & Keamanan</Text>
          <Text style={styles.subtitle}>Laporkan kendala lingkungan atau panggil bantuan darurat</Text>
        </View>

        {/* Section Panic Button / SOS */}
        <TouchableOpacity style={styles.sosBanner} onPress={handlePanicButton}>
          <View style={styles.sosIconCircle}>
            <Text style={styles.sosIconText}>🚨</Text>
          </View>
          <View style={styles.sosTextContainer}>
            <Text style={styles.sosTitle}>PANGGIL BANTUAN DARURAT</Text>
            <Text style={styles.sosSubtitle}>Tekan untuk mengirimkan sinyal SOS ke Satpam</Text>
          </View>
        </TouchableOpacity>

        {/* Form Buat Laporan */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Buat Laporan / Pengaduan</Text>

          <Text style={styles.label}>Kategori Laporan:</Text>
          <View style={styles.categoryContainer}>
            {['Fasilitas Rusak', 'Keamanan', 'Kebersihan'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipSelected,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Rincian Kejadian / Aduan:</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Jelaskan detail masalah (misal: Lampu di Gang B mati total)..."
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          {/* Dummy Upload Foto */}
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>📷 Lampirkan Foto Kejadian</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitReport}>
            <Text style={styles.submitButtonText}>Kirim Laporan</Text>
          </TouchableOpacity>
        </View>

        {/* Status Riwayat Laporan Warga */}
        <Text style={styles.sectionTitle}>RIWAYAT LAPORAN SAYA</Text>
        <View style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyCategory}>Fasilitas Rusak</Text>
            <View style={styles.statusBadgeProcessed}>
              <Text style={styles.statusTextProcessed}>Diproses</Text>
            </View>
          </View>
          <Text style={styles.historyDesc}>Lampu jalan depan rumah blok A12 padam.</Text>
          <Text style={styles.historyDate}>26 Sep 2026 • Petugas sedang dalam perjalanan</Text>
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
  sosBanner: {
    backgroundColor: '#DC2626',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  sosIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sosIconText: {
    fontSize: 20,
  },
  sosTextContainer: {
    flex: 1,
  },
  sosTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sosSubtitle: {
    color: '#FCA5A5',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  categoryChip: {
    flex: 1,
    paddingVertical: 8,
    marginHorizontal: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  categoryChipSelected: {
    backgroundColor: '#E0F2FE',
    borderColor: '#0284C7',
  },
  categoryChipText: {
    fontSize: 12,
    color: '#4A5568',
  },
  categoryChipTextSelected: {
    fontWeight: 'bold',
    color: '#0369A1',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 12,
    backgroundColor: '#FAFCFE',
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  uploadButtonText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCategory: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  statusBadgeProcessed: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusTextProcessed: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: 'bold',
  },
  historyDesc: {
    fontSize: 13,
    color: '#4A5568',
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 11,
    color: '#94A3B8',
  },
});