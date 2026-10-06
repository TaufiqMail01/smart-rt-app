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
  const [email, setEmail] = useState(''); // Opsional
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!fullName.trim() || !blockNumber.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Harap isi kolom Nama, Blok/Rumah, Nomor WhatsApp, dan Kata Sandi.');
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
      {/* Frame Header Modern Melengkung di Bawah */}
      <View style={styles.headerFrame}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()} 
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Daftar Warga Baru</Text>
        
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Formulir Registrasi Mandiri Warga</Text>
          <Text style={styles.subTitle}>
            Wilayah Terdaftar: <Text style={styles.boldText}>{tenantCode || 'RT006-RW012-KEDIP'}</Text>
          </Text>

          <Text style={styles.label}>Nama Lengkap (Sesuai KTP):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Contoh: Taufiq Ismail" 
            placeholderTextColor="#94A3B8"
            value={fullName} 
            onChangeText={setFullName} 
          />

          <Text style={styles.label}>Nomor Blok / Rumah:</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Contoh: Blok A No. 12" 
            placeholderTextColor="#94A3B8"
            value={blockNumber} 
            onChangeText={setBlockNumber} 
          />

          <Text style={styles.label}>Nomor WhatsApp Aktif (Untuk Masuk):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Contoh: 081234567890" 
            placeholderTextColor="#94A3B8"
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
          />

          <Text style={styles.label}>Alamat Email (Opsional / Tidak Wajib):</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Contoh: fulan@gmail.com (boleh dikosongkan)" 
            placeholderTextColor="#94A3B8"
            value={email} 
            onChangeText={setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none" 
          />

          {/* Input Password dengan Tombol Teks Lihat / Sembunyikan */}
          <Text style={styles.label}>Kata Sandi Akun:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Masukkan kata sandi"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnRegister} onPress={handleRegister} activeOpacity={0.8}>
            <Text style={styles.btnRegisterText}>KIRIM PENDAFTARAN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA' 
  },
  
  /* Frame Header Modern dengan Sudut Melengkung di Bawah */
  headerFrame: { 
    backgroundColor: '#0B579D', 
    paddingHorizontal: 20, 
    paddingTop: 100, 
    paddingBottom: 22, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 18 
  },

  scrollContent: { 
    padding: 20,
    paddingTop: 24, 
    paddingBottom: 40,
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 24, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  title: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#0F172A',
    marginBottom: 4,
  },
  subTitle: { 
    fontSize: 14, 
    color: '#64748B', 
    marginBottom: 24,
  },
  boldText: { 
    fontWeight: 'bold', 
    color: '#0B579D' 
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#334155', 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#CBD5E1', 
    borderRadius: 12, 
    paddingHorizontal: 16,
    paddingVertical: 16, 
    fontSize: 18, 
    marginBottom: 18, 
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },

  /* Password Container */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 24,
    paddingRight: 6,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  eyeButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0B579D',
  },

  btnRegister: { 
    backgroundColor: '#0B579D', 
    paddingVertical: 18, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 4,
    elevation: 2,
  },
  btnRegisterText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 19, 
    letterSpacing: 0.5 
  },
});