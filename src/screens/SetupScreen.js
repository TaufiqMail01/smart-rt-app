import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function SetupScreen({ onSetupComplete }) {
  const [rtNumber, setRtNumber] = useState('');
  const [rwNumber, setRwNumber] = useState('');
  const [tokenCode, setTokenCode] = useState('');

  // Handler khusus filter angka saja untuk Nomor RT
  const handleRtChange = (text) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    setRtNumber(numericOnly);
  };

  // Handler khusus filter angka saja untuk Nomor RW
  const handleRwChange = (text) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    setRwNumber(numericOnly);
  };

  const handleVerifyCode = () => {
    if (!rtNumber.trim() || !rwNumber.trim() || !tokenCode.trim()) {
      Alert.alert('Peringatan', 'Silakan lengkapi Nomor RT, Nomor RW, dan Kode Token dari Ketua RT Anda.');
      return;
    }

    const formattedRt = rtNumber.padStart(2, '0');
    const formattedRw = rwNumber.padStart(2, '0');
    const cleanToken = tokenCode.trim().toUpperCase();

    // Format ID Wilayah Unik Multi-Tenant
    const fullTenantCode = `RT${formattedRt}-RW${formattedRw}-${cleanToken}`;

    Alert.alert(
      'Mencocokkan Wilayah',
      `Menghubungkan ke RT ${formattedRt} / RW ${formattedRw}...`
    );

    if (onSetupComplete) {
      onSetupComplete(fullTenantCode);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.icon}>🛡️</Text>
        <Text style={styles.title}>Verifikasi Wilayah RT & RW</Text>
        <Text style={styles.subtitle}>
          Masukkan nomor RT, RW, dan Kode Token Resmi dari Pengurus Lingkungan Anda.
        </Text>

        <View style={styles.inputCard}>
          <View style={styles.rowInput}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Nomor RT:</Text>
              <TextInput
                style={styles.input}
                placeholder="05"
                value={rtNumber}
                onChangeText={handleRtChange}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Nomor RW:</Text>
              <TextInput
                style={styles.input}
                placeholder="02"
                value={rwNumber}
                onChangeText={handleRwChange}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          <Text style={styles.label}>Kode Token RT (Dari Pengurus):</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: ASRI-8X92"
            value={tokenCode}
            onChangeText={setTokenCode}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
            <Text style={styles.buttonText}>Verifikasi & Hubungkan</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B579D',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    fontSize: 50,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
    lineHeight: 18,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  rowInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});