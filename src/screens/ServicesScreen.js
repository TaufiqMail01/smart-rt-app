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

export default function ServicesScreen() {
  const [selectedLetter, setSelectedLetter] = useState('Surat Pengantar KTP');
  const [notes, setNotes] = useState('');

  const handleApply = () => {
    if (!notes.trim()) {
      Alert.alert('Peringatan', 'Silakan isi alasan / keperluan pengajuan surat.');
      return;
    }
    Alert.alert('Sukses', 'Pengajuan surat berhasil dikirim ke Pengurus RT!');
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Layanan Surat Digital</Text>
          <Text style={styles.subtitle}>Ajukan surat pengantar RT tanpa perlu tatap muka</Text>
        </View>

        {/* Form Pengajuan Surat */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Form Pengajuan Baru</Text>
          
          <Text style={styles.label}>Pilih Jenis Surat:</Text>
          <View style={styles.pickerContainer}>
            {['Surat Pengantar KTP', 'Keterangan Domisili', 'Surat Keterangan Usaha'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeOption,
                  selectedLetter === type && styles.typeOptionSelected,
                ]}
                onPress={() => setSelectedLetter(type)}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    selectedLetter === type && styles.typeOptionTextSelected,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Keperluan / Alasan:</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Contoh: Untuk persyaratan pembuatan KTP baru..."
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />

          <TouchableOpacity style={styles.buttonSubmit} onPress={handleApply}>
            <Text style={styles.buttonSubmitText}>Kirim Pengajuan</Text>
          </TouchableOpacity>
        </View>

        {/* Status Tracker Pengajuan Terakhir */}
        <Text style={styles.sectionTitle}>STATUS PENGAJUAN TERAKHIR</Text>
        <View style={styles.trackerCard}>
          <View style={styles.trackerHeader}>
            <Text style={styles.trackerTitle}>Keterangan Domisili</Text>
            <Text style={styles.trackerDate}>28 Sep 2026</Text>
          </View>

          {/* Stepper Status */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepCompleted]}>
                <Text style={styles.stepCheck}>✓</Text>
              </View>
              <Text style={styles.stepLabel}>Diajukan</Text>
            </View>

            <View style={[styles.stepLine, styles.stepLineActive]} />

            <View style={styles.stepItem}>
              <View style={[styles.stepCircle, styles.stepActive]}>
                <Text style={styles.stepTextActive}>2</Text>
              </View>
              <Text style={styles.stepLabel}>Ditinjau RT</Text>
            </View>

            <View style={styles.stepLine} />

            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepText}>3</Text>
              </View>
              <Text style={styles.stepLabel}>Selesai</Text>
            </View>
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
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
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
  pickerContainer: {
    marginBottom: 16,
  },
  typeOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3182CE',
  },
  typeOptionText: {
    fontSize: 13,
    color: '#4A5568',
  },
  typeOptionTextSelected: {
    fontWeight: 'bold',
    color: '#2B6CB0',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#FAFCFE',
  },
  buttonSubmit: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonSubmitText: {
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
  trackerCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  trackerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trackerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  trackerDate: {
    fontSize: 12,
    color: '#A0AEC0',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCompleted: {
    backgroundColor: '#38A169',
  },
  stepActive: {
    backgroundColor: '#3182CE',
  },
  stepCheck: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    color: '#718096',
    fontSize: 12,
  },
  stepTextActive: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 11,
    color: '#4A5568',
    marginTop: 6,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepLineActive: {
    backgroundColor: '#38A169',
  },
});