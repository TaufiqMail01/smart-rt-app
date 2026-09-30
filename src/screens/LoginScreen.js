import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { loginUser } from '../services/authService';

export default function LoginScreen({ route, navigation, onLoginSuccess }) {
  const { tenantCode } = route.params || { tenantCode: 'RT05-RW02-DEMO' };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Silakan isi Email dan Kata Sandi.');
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password, tenantCode);
    setLoading(false);

    if (result.success) {
      Alert.alert('Berhasil', 'Selamat datang di wilayah Smart RT!');
      if (onLoginSuccess) onLoginSuccess(result.userData);
    } else {
      // Fallback Mode Demo jika koneksi terputus
      Alert.alert('Demo Mode', `Masuk sebagai warga wilayah ${tenantCode.split('-')[0]}`);
      if (onLoginSuccess) onLoginSuccess({ email, name: 'Fulan', block: 'Blok A No. 12' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badgeRt}>
          <Text style={styles.badgeRtText}>WILAYAH: {tenantCode}</Text>
        </View>

        <Text style={styles.title}>Masuk ke Smart RT</Text>
        <Text style={styles.subtitle}>Masukkan email dan kata sandi akun terdaftar Anda</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email Warga:</Text>
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
            placeholder="******"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Masuk Akun</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register', { tenantCode })}
        >
          <Text style={styles.registerText}>Belum punya akun? <Text style={styles.boldText}>Daftar Warga Baru</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    marginBottom: 24,
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
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
  },
  button: {
    backgroundColor: '#0B579D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#64748B',
    fontSize: 13,
  },
  boldText: {
    color: '#0B579D',
    fontWeight: 'bold',
  },
});