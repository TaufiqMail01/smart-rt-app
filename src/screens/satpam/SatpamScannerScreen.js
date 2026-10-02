import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Alert } from 'react-native';

export default function SatpamScannerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📷 Pos Jaga - Pemindai Pass Tamu</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.scannerBox}>
          <Text style={styles.cameraText}>[ SIMULASI KAMERA SCANNER ]</Text>
          <Text style={styles.cameraSub}>Arahkan Kamera ke Kode QR Tamu Warga</Text>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => Alert.alert('Validasi Berhasil', 'Pass Tamu Valid! Diizinkan Masuk.')}
        >
          <Text style={styles.btnText}>Simulasi Scan QR Pass</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  header: { backgroundColor: '#0B579D', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  content: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  scannerBox: { width: '100%', height: 250, backgroundColor: '#1E293B', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  cameraText: { color: '#38BDF8', fontWeight: 'bold', fontSize: 16 },
  cameraSub: { color: '#94A3B8', fontSize: 12, marginTop: 6 },
  btn: { backgroundColor: '#16A34A', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10 },
  btnText: { color: '#FFF', fontWeight: 'bold' },
});