import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VerifikasiWargaScreen({ navigation }) {
  // Data tiruan warga yang mendaftar dan menunggu verifikasi
  const [pendingUsers, setPendingUsers] = useState([
    { id: '1', name: 'Budi Santoso', block: 'Blok A No. 5', whatsapp: '08123456789' },
    { id: '2', name: 'Siti Aminah', block: 'Blok B No. 12', whatsapp: '08987654321' },
  ]);

  const handleVerify = (id, name) => {
    Alert.alert('Berhasil', `Warga atas nama ${name} telah disetujui dan diaktifkan.`);
    setPendingUsers(pendingUsers.filter(user => user.id !== id));
  };

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
        <Text style={styles.headerTitle}>Verifikasi Warga Baru</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {pendingUsers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>✨ Semua warga telah diverifikasi.</Text>
          </View>
        ) : (
          pendingUsers.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.detail}>Rumah: {item.block}</Text>
              <Text style={styles.detail}>WhatsApp: {item.whatsapp}</Text>
              
              <TouchableOpacity 
                style={styles.btnApprove} 
                onPress={() => handleVerify(item.id, item.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>SETUJUI AKUN</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
    paddingBottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 18 },
  scrollContent: { padding: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  name: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  detail: { fontSize: 15, color: '#64748B', marginBottom: 6 },
  btnApprove: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
});