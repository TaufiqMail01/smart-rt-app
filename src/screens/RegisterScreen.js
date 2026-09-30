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
  ActivityIndicator,
} from 'react-native';
import { registerUser } from '../services/authService';

export default function RegisterScreen({ route, navigation }) {
  const { tenantCode } = route.params || { tenantCode: 'RT05-RW02-DEMO' };

  const [name, setName] = useState('');
  const [block, setBlock] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter ketat: Menghapus semua karakter selain angka (0-9)
  const handlePhoneChange = (text) => {
    const numericOnly = text.replace(/[^0-9]/g, '');
    setPhone(numericOnly);
  };

  const handleRegister = async () => {
    if (!name.trim() || !block.trim() || !phone.trim() || !email.trim() || !password) {
      Alert.alert('Peringatan', 'Silakan lengkapi semua kolom pendaftaran.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Peringatan', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Peringatan', 'Kata sandi minimal 6 karakter.');
      return;
    }

    setLoading(true);

    const userData = {
      name,
      block,
      phone,
      tenantCode,
    };

    const result = await registerUser(email, password, userData);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Pendaftaran Dikirim',
        'Akun Anda berhasil didaftarkan ke Supabase DB. Menunggu verifikasi dari Pengurus RT.',
        [
          {
            text: 'Masuk Sekarang',
            onPress: () => navigation.navigate('Login', { tenantCode }),
          },
        ]
      );
    } else {
      Alert.alert('Gagal Mendaftar', result.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.badgeRt}>
          <Text style={styles.badgeRtText}>WILAYAH: {tenantCode}</Text>
        </View>

        <Text style={styles.title}>Daftar Warga Baru</Text>
        <Text style={styles.subtitle}>Lengkapi identitas Anda untuk terhubung ke RT setempat</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nama Lengkap (Sesuai KTP):</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Fulan"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Blok / Nomor Rumah:</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Blok A No. 12"
            value={block}
            onChangeText={setBlock}
          />

          <Text style={styles.label}>Nomor WhatsApp / HP (Angka Saja):</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 081234567890"
            value={phone}
            onChangeText={handlePhoneChange}
            keyboardType="number-pad"
            maxLength={15}
          />

          <Text style={styles.label}>Alamat Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="contoh: fulan@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Kata Sandi:</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimal 6 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Konfirmasi Kata Sandi:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ulangi kata sandi"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Daftar Sekarang</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login', { tenantCode })}
        >
          <Text style={styles.loginText}>
            Sudah memiliki akun? <Text style={styles.boldText}>Masuk ke Akun</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  badgeRt: {
    alignSelf: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeRtText: {
    color: '#0284C7',
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
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
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#0B579D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  loginText: {
    color: '#64748B',
    fontSize: 13,
  },
  boldText: {
    color: '#0B579D',
    fontWeight: 'bold',
  },
});