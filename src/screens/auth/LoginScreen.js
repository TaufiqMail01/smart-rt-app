import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ROLE_PERMISSIONS = {
  super_admin: {
    'warga.view': true, 'warga.create': true, 'warga.update': true, 'warga.delete': true, 'warga.verify': true,
    'surat.create': true, 'surat.approve': true, 'pengumuman.create': true, 'kegiatan.create': true,
    'keuangan.view': true, 'keuangan.create': true, 'keuangan.delete': true, 'pengurus.manage': true,
    'laporan.view': true, 'settings.update': true,
  },
  ketua_rt: {
    'warga.view': true, 'warga.create': true, 'warga.update': true, 'warga.delete': true, 'warga.verify': true,
    'surat.create': true, 'surat.approve': true, 'pengumuman.create': true, 'kegiatan.create': true,
    'keuangan.view': true, 'keuangan.create': true, 'keuangan.delete': true, 'pengurus.manage': true,
    'laporan.view': true, 'settings.update': true,
  },
  sekretaris: {
    'warga.view': true, 'warga.create': true, 'warga.update': true, 'warga.delete': false, 'warga.verify': true,
    'surat.create': true, 'surat.approve': true, 'pengumuman.create': true, 'kegiatan.create': true,
    'keuangan.view': true, 'keuangan.create': false, 'keuangan.delete': false, 'pengurus.manage': false,
    'laporan.view': true, 'settings.update': false,
  },
  bendahara: {
    'warga.view': true, 'warga.create': false, 'warga.update': false, 'warga.delete': false, 'warga.verify': false,
    'surat.create': false, 'surat.approve': false, 'pengumuman.create': false, 'kegiatan.create': false,
    'keuangan.view': true, 'keuangan.create': true, 'keuangan.delete': true, 'pengurus.manage': false,
    'laporan.view': true, 'settings.update': false,
  },
  pengurus: {
    'warga.view': true, 'warga.create': false, 'warga.update': false, 'warga.delete': false, 'warga.verify': false,
    'surat.create': false, 'surat.approve': false, 'pengumuman.create': false, 'kegiatan.create': true,
    'keuangan.view': true, 'keuangan.create': false, 'keuangan.delete': false, 'pengurus.manage': false,
    'laporan.view': true, 'settings.update': false,
  },
  warga: {
    'warga.view': true, 'warga.create': false, 'warga.update': false, 'warga.delete': false, 'warga.verify': false,
    'surat.create': true, 'surat.approve': false, 'pengumuman.create': false, 'kegiatan.create': false,
    'keuangan.view': true, 'keuangan.create': false, 'keuangan.delete': false, 'pengurus.manage': false,
    'laporan.view': true, 'settings.update': false,
  },
};

export default function LoginScreen({ tenantCode, onLoginSuccess, onChangeTenant, navigation }) {
  const [step, setStep] = useState('select_role'); 
  const [selectedRole, setSelectedRole] = useState(null);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const rolesList = [
    { key: 'super_admin', title: '1. Super Admin', desc: 'Akses penuh sistem & manajemen global', icon: '👑' },
    { key: 'ketua_rt', title: '2. Ketua RT', desc: 'Pengelolaan wilayah dan persetujuan utama', icon: '🏠' },
    { key: 'sekretaris', title: '3. Sekretaris', desc: 'Pengelolaan data warga & persuratan', icon: '📋' },
    { key: 'bendahara', title: '4. Bendahara', desc: 'Pencatatan kas dan iuran keuangan RT', icon: '💰' },
    { key: 'pengurus', title: '5. Pengurus RT', desc: 'Operasional kegiatan & pemantauan', icon: '🛡️' },
    { key: 'warga', title: '6. Warga', desc: 'Layanan mandiri, laporan, & informasi warga', icon: '👤' },
  ];

  const handleSelectRole = (roleKey) => {
    setSelectedRole(roleKey);
    setStep('input_credentials');
    setIdentifier('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Peringatan', 'Harap isi data kredensial login Anda dengan lengkap.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userData = {
        name: `Akun ${selectedRole.toUpperCase().replace('_', ' ')}`,
        phone: identifier.trim(),
        role: selectedRole,
        tenantCode: tenantCode,
        permissions: ROLE_PERMISSIONS[selectedRole] || ROLE_PERMISSIONS['warga'],
      };
      onLoginSuccess(userData);
    }, 800);
  };

  if (step === 'select_role') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0B579D" />
        <View style={styles.headerFrame}>
          <Text style={styles.headerTitle}>Pilih Peran Akses Anda</Text>
          <Text style={styles.headerSubtitle}>Silakan tentukan peran Anda untuk melanjutkan ke menu login</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.gridContainer}>
            {rolesList.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={styles.roleCardButton}
                onPress={() => handleSelectRole(item.key)}
                activeOpacity={0.7}
              >
                <View style={styles.roleIconContainer}>
                  <Text style={styles.roleEmoji}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roleCardTitle}>{item.title}</Text>
                  <Text style={styles.roleCardDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.roleChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const activeRoleLabel = rolesList.find(r => r.key === selectedRole)?.title || '';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />
      <View style={styles.headerFrame}>
        <TouchableOpacity onPress={() => setStep('select_role')} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>Pilih Akses</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Login {activeRoleLabel}</Text>
        <Text style={styles.headerSubtitle}>Masukkan kredensial yang terdaftar di sistem</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.selectedRoleBadge}>
            <Text style={styles.selectedRoleText}>Peran Aktif: {activeRoleLabel}</Text>
          </View>

          <Text style={styles.label}>
            {selectedRole === 'super_admin' ? 'Nomor WhatsApp / ID Admin:' : 'Nomor WhatsApp Terdaftar:'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="081234567890"
            placeholderTextColor="#94A3B8"
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Kata Sandi:</Text>
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
              <Text style={styles.eyeButtonText}>{showPassword ? 'Sembunyi' : 'Lihat'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnLogin} onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.btnLoginText}>MASUK SEKARANG</Text>}
          </TouchableOpacity>

          {selectedRole === 'warga' && (
            <View style={styles.registerContainer}>
              <Text style={styles.registerLabel}>Belum punya akun warga?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
                <Text style={styles.registerLink}>Daftar Akun Warga Baru</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    paddingBottom: 24, 
    borderBottomLeftRadius: 28, 
    borderBottomRightRadius: 28, 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  headerSubtitle: { fontSize: 13, color: '#BAE6FD', marginTop: 4, textAlign: 'center' },
  
  // Tombol Ganti Peran Modern & Timbul
  backBtn: { 
    alignSelf: 'flex-start', 
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)', 
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20, 
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)', 
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  backText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 13,
    letterSpacing: 0.3,
  },

  scrollContent: { padding: 20, paddingBottom: 40 },
  gridContainer: { marginTop: 6 },
  
  // Kartu Pilihan Peran Modern & Timbul
  roleCardButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 14, 
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  roleIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#F0F6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  roleEmoji: { fontSize: 22 },
  roleCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 2 },
  roleCardDesc: { fontSize: 12, color: '#64748B', lineHeight: 16 },
  roleChevron: { fontSize: 22, color: '#94A3B8', fontWeight: 'bold', marginLeft: 8 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, elevation: 4 },
  selectedRoleBadge: { backgroundColor: '#EFF6FF', padding: 12, borderRadius: 10, marginBottom: 18, borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'center' },
  selectedRoleText: { color: '#1D4ED8', fontWeight: 'bold', fontSize: 14 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#334155', marginBottom: 6 },
  input: { borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 16, backgroundColor: '#F8FAFC', color: '#0F172A' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#CBD5E1', borderRadius: 12, backgroundColor: '#F8FAFC', marginBottom: 20, paddingRight: 6 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0F172A' },
  eyeButton: { paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#E2E8F0', borderRadius: 8 },
  eyeButtonText: { fontSize: 12, fontWeight: 'bold', color: '#0B579D' },
  btnLogin: { backgroundColor: '#0B579D', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  btnLoginText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  registerContainer: { marginTop: 18, alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  registerLabel: { fontSize: 13, color: '#64748B' },
  registerLink: { fontSize: 14, fontWeight: 'bold', color: '#0284C7', marginTop: 4 },
});