import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ user, tenantCode, onLogout }) {
  const userName = user?.name || 'Warga RT';
  const userRole = user?.role ? user.role.toUpperCase().replace('_', ' ') : 'WARGA';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      {/* Header Beranda Warga */}
      <View style={styles.headerFrame}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeSubtitle}>Selamat Datang,</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{userName}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Kartu Status Warga & Wilayah */}
        <View style={styles.infoCard}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>Peran: {userRole}</Text>
          </View>
          <Text style={styles.tenantLabel}>Wilayah RT Aktif</Text>
          <Text style={styles.tenantValue}>{tenantCode || 'RT006 / RW012'}</Text>
          <Text style={styles.statusText}>🟢 Status Akun: Terverifikasi</Text>
        </View>

        {/* Menu Pintasan Fitur Warga */}
        <Text style={styles.sectionTitle}>Layanan & Fitur Warga</Text>

        <View style={styles.menuGrid}>
          <TouchableOpacity style={styles.menuBox} activeOpacity={0.8}>
            <Text style={styles.menuEmoji}>📢</Text>
            <Text style={styles.menuText}>Laporan Warga</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBox} activeOpacity={0.8}>
            <Text style={styles.menuEmoji}>📜</Text>
            <Text style={styles.menuText}>Buat Surat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBox} activeOpacity={0.8}>
            <Text style={styles.menuEmoji}>💰</Text>
            <Text style={styles.menuText}>Iuran Kas RT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuBox} activeOpacity={0.8}>
            <Text style={styles.menuEmoji}>🛡️️</Text>
            <Text style={styles.menuText}>Jadwal Ronda</Text>
          </TouchableOpacity>
        </View>

        {/* Pengumuman RT */}
        <View style={styles.announcementCard}>
          <Text style={styles.announcementTitle}>📌 Pengumuman RT Terbaru</Text>
          <Text style={styles.announcementDesc}>
            Kerja bakti pembersihan saluran air lingkungan akan dilaksanakan pada hari Minggu pagi pukul 07.00 WIB. Diharapkan kehadiran seluruh warga.
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  welcomeSubtitle: { fontSize: 13, color: '#BAE6FD', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  badgeText: { fontSize: 12, fontWeight: 'bold', color: '#0369A1' },
  tenantLabel: { fontSize: 13, color: '#64748B', fontWeight: 'bold' },
  tenantValue: { fontSize: 18, fontWeight: 'bold', color: '#0B579D', marginVertical: 2 },
  statusText: { fontSize: 13, color: '#10B981', fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 14 },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuBox: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: '0.05',
    shadowRadius: 6,
  },
  menuEmoji: { fontSize: 32, marginBottom: 8 },
  menuText: { fontSize: 14, fontWeight: 'bold', color: '#334155', textAlign: 'center' },
  announcementCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  announcementTitle: { fontSize: 15, fontWeight: 'bold', color: '#B45309', marginBottom: 6 },
  announcementDesc: { fontSize: 13, color: '#78350F', lineHeight: 20 },
});