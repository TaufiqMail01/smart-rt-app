import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';

export default function ProfileScreen({ user, tenantCode, onLogout, navigation }) {
  // Simulasi data profil warga/admin
  const currentUser = user || {
    name: 'Pak Taufiq',
    block: 'Blok A No. 12',
    email: 'taufiq@email.com',
    phone: '081234567890',
    role: 'admin_rt', // Ubah ke 'warga' untuk tes tampilan warga biasa
    status: 'approved',
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Logout', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: onLogout },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header Profil */}
        <View style={styles.headerCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userBlock}>{currentUser.block}</Text>
          <View style={styles.badgeTenant}>
            <Text style={styles.badgeTenantText}>WILAYAH: {tenantCode || 'RT05-RW02'}</Text>
          </View>
        </View>

        {/* Akses Khusus Admin RT (Hanya muncul jika role === 'admin_rt') */}
        {currentUser.role === 'admin_rt' && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>AKSES PENGURUS RT</Text>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('AdminDashboard', { tenantCode })}
            >
              <Text style={styles.adminIcon}>🛡️</Text>
              <View style={styles.adminTextContainer}>
                <Text style={styles.adminButtonTitle}>Panel Verifikasi Warga</Text>
                <Text style={styles.adminButtonSub}>Setujui pendaftaran warga & permohonan surat</Text>
              </View>
              <Text style={styles.arrowIcon}>➔</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Informasi Akun Warga */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email Warga</Text>
            <Text style={styles.infoValue}>{currentUser.email}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nomor WhatsApp / HP</Text>
            <Text style={styles.infoValue}>{currentUser.phone}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status Keanggotaan</Text>
            <Text style={[styles.infoValue, { color: '#10B981', fontWeight: 'bold' }]}>
              {currentUser.status === 'approved' ? 'VERIFIKASI AKTIF' : 'MENUNGGU APPROVAL'}
            </Text>
          </View>
        </View>

        {/* Tombol Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
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
    padding: 20,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0B579D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  userBlock: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  badgeTenant: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  badgeTenantText: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: 'bold',
  },
  adminSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  adminButton: {
    backgroundColor: '#0B579D',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  adminTextContainer: {
    flex: 1,
  },
  adminButtonTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  adminButtonSub: {
    color: '#E2E8F0',
    fontSize: 11,
    marginTop: 2,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 1,
  },
  infoRow: {
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    color: '#1E293B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 14,
  },
});