import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';

export default function ProfileScreen() {
  const handleLogout = () => {
    Alert.alert('Konfirmasi', 'Apakah Anda yakin ingin keluar dari akun?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: () => Alert.alert('Sukses', 'Berhasil keluar.') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profil Warga</Text>
          <Text style={styles.subtitle}>Informasi keanggotaan dan identitas keluarga</Text>
        </View>

        {/* Kartu Anggota Digital Warga */}
        <View style={styles.idCard}>
          <View style={styles.idCardHeader}>
            <View>
              <Text style={styles.rtTitle}>KARTU WARGA RT 05 / RW 02</Text>
              <Text style={styles.subRtTitle}>Kelurahan Asri Lingkungan</Text>
            </View>
            <Text style={styles.badgeStatus}>TETAP</Text>
          </View>

          <View style={styles.idCardBody}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>TI</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>Taufiq Ismail</Text>
              <Text style={styles.userAddress}>Blok A No. 12</Text>
              <Text style={styles.userNik}>NIK: 3171012345670001</Text>
            </View>
          </View>

          <View style={styles.idCardFooter}>
            <Text style={styles.idCardCode}>ID WARGA: RT05-A12</Text>
            <Text style={styles.qrCodeIcon}>📱 QR Verified</Text>
          </View>
        </View>

        {/* Anggota Keluarga Terdaftar */}
        <Text style={styles.sectionTitle}>ANGGOTA KELUARGA TERDAFTAR</Text>
        <View style={styles.familyCard}>
          <View style={styles.familyItem}>
            <Text style={styles.familyIcon}>👤</Text>
            <View style={styles.familyInfo}>
              <Text style={styles.familyName}>Nurul Kurnia Audina</Text>
              <Text style={styles.familyRole}>Istri • Terdaftar KK</Text>
            </View>
          </View>
          
          <View style={styles.familyDivider} />

          <View style={styles.familyItem}>
            <Text style={styles.familyIcon}>👶</Text>
            <View style={styles.familyInfo}>
              <Text style={styles.familyName}>Anak</Text>
              <Text style={styles.familyRole}>Anak • Terdaftar KK</Text>
            </View>
          </View>
        </View>

        {/* Menu Pengaturan & Akun */}
        <Text style={styles.sectionTitle}>PENGATURAN AKUN</Text>
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>🔒 Ubah Kata Sandi</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>🔔 Pengaturan Notifikasi</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuItemText}>📄 Dokumen Saya (KTP/KK)</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.noBorder]} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Keluar Akun</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  subtitle: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  idCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  idCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  rtTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  subRtTitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  badgeStatus: {
    backgroundColor: '#10B981',
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userAddress: {
    color: '#CBD5E1',
    fontSize: 13,
    marginTop: 2,
  },
  userNik: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  idCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  idCardCode: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  qrCodeIcon: {
    color: '#94A3B8',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A5568',
    marginBottom: 12,
  },
  familyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 1,
  },
  familyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  familyIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  familyInfo: {
    flex: 1,
  },
  familyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  familyRole: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2,
  },
  familyDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 12,
  },
  menuContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
  },
  logoutText: {
    fontSize: 13,
    color: '#E53E3E',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 18,
    color: '#CBD5E1',
  },
});