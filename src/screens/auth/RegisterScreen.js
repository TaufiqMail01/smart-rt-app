import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';

export default function RegisterScreen({ tenantCode, navigation }) {
  const [fullName, setFullName] = useState('');
  const [blockNumber, setBlockNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State Show/Hide Password

  const handleRegister = () => {
    if (!fullName.trim() || !blockNumber.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Harap isi seluruh formulir pendaftaran warga.');
      return;
    }

    Alert.alert(
      '🎉 Pendaftaran Berhasil!',
      'Akun Anda berhasil terdaftar. Pengurus RT akan memverifikasi data rumah Anda sebelum akses penuh diaktifkan.',
      [
        {
          text: 'Kembali ke Login',
          onPress: () => navigation.navigate('Login'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Kembali ke Login</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daftar Warga Baru</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Formulir Registrasi Mandiri Warga</Text>
          <Text style={styles.subTitle}>Wilayah Terdaftar: <Text style={styles.boldText}>{tenantCode || 'RT006-RW012'}</Text></Text>

          <Text style={styles.label}>Nama Lengkap (Sesuai KTP):</Text>
          <TextInput style={styles.input} placeholder="Contoh: Taufiq Ismail" value={fullName} onChangeText={setFullName} />

          <Text style={styles.label}>Nomor Blok / Rumah:</Text>
          <TextInput style={styles.input} placeholder="Contoh: Blok A No. 12" value={blockNumber} onChangeText={setBlockNumber} />

          <Text style={styles.label}>Nomor WhatsApp / HP Active:</Text>
          <TextInput style={styles.input} placeholder="Contoh: 081234567890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>Alamat Email:</Text>
          <TextInput style={styles.input} placeholder="fulan@gmail.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

          {/* Input Password + Tombol Eye Show/Hide */}
          <Text style={styles.label}>Kata Sandi Akun:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeIcon}>{showPassword ? '👁' : '👁‍🗨'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnRegister} onPress={handleRegister}>
            <Text style={styles.btnRegisterText}>KIRIM PENDAFTARAN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  header: { backgroundColor: '#0B579D', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  headerTitle: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  scrollContent: { padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, elevation: 3 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  subTitle: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 16 },
  boldText: { fontWeight: 'bold', color: '#0284C7' },
  label: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 13, marginBottom: 12, backgroundColor: '#F8FAFC' },

  /* Password Container dengan Ikon Mata */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeIcon: {
    fontSize: 16,
  },

  btnRegister: { backgroundColor: '#0B579D', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  btnRegisterText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
});