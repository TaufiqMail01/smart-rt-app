import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location'; // 🟢 Module untuk deteksi GPS saat login

export default function LoginScreen({ tenantCode, onLoginSuccess, onChangeTenant, navigation }) {
  const [activeRole, setActiveRole] = useState('warga'); // 'warga', 'satpam', 'admin_rt'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // State Modal Lupa Password
  const [isForgotPasswordVisible, setIsForgotPasswordVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Handler Login + Aktifkan GPS Lokasi
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Harap isi email dan kata sandi Anda.');
      return;
    }

    setLoading(true);

    // 🟢 MINTA & AKTIFKAN IZIN LOKASI GPS UNTUK FITUR SOS
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Izin Lokasi Dibutuhkan',
          'Aplikasi membutuhkan akses GPS lokasi agar fitur Tombol Darurat (SOS) dapat mengirim titik lokasi Anda ke Pos Satpam saat situasi darurat.'
        );
      } else {
        // Ambil koordinat GPS awal secara presisi
        await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      }
    } catch (error) {
      console.log('Error meminta izin GPS lokasi saat login:', error);
    }

    setLoading(false);

    const dummyUser = {
      id: 'usr-123',
      name: activeRole === 'admin_rt' ? 'Pak Taufiq' : activeRole === 'satpam' ? 'Pak Danang' : 'Pak Budi',
      block: 'Blok A No. 12',
      email: email.trim(),
      role: activeRole,
      status: 'approved',
    };

    Alert.alert('Berhasil Login', `Selamat datang kembali, ${dummyUser.name}! GPS lokasi telah aktif untuk fitur SOS.`);
    onLoginSuccess(dummyUser);
  };

  const handleSendResetPassword = () => {
    if (!resetEmail.trim()) {
      Alert.alert('Peringatan', 'Harap masukkan alamat email Anda.');
      return;
    }

    setIsForgotPasswordVisible(false);
    Alert.alert(
      'Tautan Dikirimkan',
      `Instruksi pemulihan kata sandi telah dikirimkan ke email ${resetEmail.trim()}. Silakan periksa kotak masuk Anda.`
    );
    setResetEmail('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FA" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Container Utama Diturunkan Kebawah */}
        <View style={styles.centerContainer}>
          
          {/* Header Smart RT */}
          <View style={styles.headerBox}>
            <Text style={styles.appTitle}>SMART RT</Text>

            <TouchableOpacity style={styles.tenantBadge} onPress={onChangeTenant} activeOpacity={0.7}>
              <Text style={styles.tenantBadgeText}>📍 Wilayah: {tenantCode || 'RT006-RW012-KEDIP'} (Ganti)</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Pilihan Peran */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeRole === 'warga' && styles.tabButtonActive]}
              onPress={() => setActiveRole('warga')}
            >
              <Text style={[styles.tabText, activeRole === 'warga' && styles.tabTextActive]}>🧑‍🤝‍🧑 Warga</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeRole === 'satpam' && styles.tabButtonActive]}
              onPress={() => setActiveRole('satpam')}
            >
              <Text style={[styles.tabText, activeRole === 'satpam' && styles.tabTextActive]}>🛡️ Satpam</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabButton, activeRole === 'admin_rt' && styles.tabButtonActive]}
              onPress={() => setActiveRole('admin_rt')}
            >
              <Text style={[styles.tabText, activeRole === 'admin_rt' && styles.tabTextActive]}>👑 Pengurus</Text>
            </TouchableOpacity>
          </View>

          {/* Card Form Login */}
          <View style={styles.card}>
            <Text style={styles.formTitle}>
              Login Akun {activeRole === 'warga' ? 'Warga' : activeRole === 'satpam' ? 'Satpam / Pos Jaga' : 'Pengurus RT'}
            </Text>

            <Text style={styles.label}>Email Terdaftar:</Text>
            <TextInput
              style={styles.input}
              placeholder="contoh: fulan@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Input Password + Eye Button */}
            <Text style={styles.label}>Kata Sandi:</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '🙈'}</Text>
              </TouchableOpacity>
            </View>

            {/* Link Lupa Password */}
            <TouchableOpacity style={styles.forgotPasswordRow} onPress={() => setIsForgotPasswordVisible(true)}>
              <Text style={styles.forgotPasswordText}>Lupa kata sandi?</Text>
            </TouchableOpacity>

            {/* Tombol Masuk */}
            <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.btnLoginText}>MASUK KE APLIKASI</Text>
              )}
            </TouchableOpacity>

            {/* Link Pendaftaran Mandiri Warga */}
            {activeRole === 'warga' && (
              <View style={styles.registerRow}>
                <Text style={styles.registerSubText}>Belum memiliki akun warga? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerLinkText}>Daftar Mandiri</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Modal Dialog Lupa Password */}
      <Modal visible={isForgotPasswordVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pemulihan Kata Sandi</Text>
            <Text style={styles.modalSub}>
              Masukkan email terdaftar Anda untuk menerima tautan pemulihan kata sandi.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Masukkan email Anda..."
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnCancelModal} onPress={() => setIsForgotPasswordVisible(false)}>
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnSendModal} onPress={handleSendResetPassword}>
                <Text style={styles.btnSendText}>Kirim Tautan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  centerContainer: {
    width: '100%',
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0B579D',
    letterSpacing: 1,
  },
  tenantBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  tenantBadgeText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: 'bold',
  },

  /* Tab Peran */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 6,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#0B579D',
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  /* Form Card */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },

  /* Password Field */
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 10,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  eyeIcon: {
    fontSize: 20,
  },

  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginBottom: 22,
  },
  forgotPasswordText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '600',
  },

  btnLogin: {
    backgroundColor: '#0B579D',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerSubText: {
    fontSize: 13,
    color: '#64748B',
  },
  registerLinkText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0284C7',
  },

  /* Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 18,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  btnCancelModal: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
  },
  btnCancelText: {
    color: '#64748B',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnSendModal: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnSendText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});