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

export default function KetuaRtDashboardScreen({ route, navigation, onLogout }) {
  const { tenantCode, user } = route.params || {};
  const permissions = user?.permissions || {};
  const userRoleText = user?.role ? user.role.toUpperCase().replace('_', ' ') : 'PENGURUS';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      <View style={styles.headerFrame}>
        <View style={{ flex: 1 }}>
          <Text style={styles.welcomeText}>Panel Akses: {userRoleText}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{user?.name || 'Pengurus RT'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Wilayah Aktif</Text>
          <Text style={styles.infoValue}>{tenantCode || 'GLOBAL-SYSTEM'}</Text>
          <Text style={styles.infoDesc}>Status Akses: Aktif & Terverifikasi</Text>
        </View>

        <Text style={styles.sectionTitle}>Menu Operasional & Wewenang</Text>

        {permissions['warga.verify'] && (
          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => navigation.navigate('VerifikasiWarga', { tenantCode })}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>👥</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.menuTitle}>Verifikasi Warga Baru</Text>
              <Text style={styles.menuDesc}>Setujui atau kelola pendaftaran warga lingkungan</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        {permissions['keuangan.view'] && (
          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => navigation.navigate('Finance', { user })}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>💰</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.menuTitle}>Kas & Keuangan RT</Text>
              <Text style={styles.menuDesc}>
                {permissions['keuangan.create'] ? 'Kelola dan catat iuran warga' : 'Lihat transparansi laporan kas RT'}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        {permissions['settings.update'] && (
          <TouchableOpacity 
            style={styles.menuCard} 
            onPress={() => navigation.navigate('PengaturanRt', { tenantCode })}
            activeOpacity={0.8}
          >
            <Text style={styles.menuIcon}>⚙️</Text>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.menuTitle}>Pengaturan & Kode Unik</Text>
              <Text style={styles.menuDesc}>Konfigurasi wilayah dan kode akses tenant</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}

        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ Menu di atas tampil otomatis berdasarkan hak akses wewenang peran {userRoleText}.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  headerFrame: { backgroundColor: '#0B579D', paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  welcomeText: { fontSize: 13, color: '#BAE6FD', fontWeight: 'bold', marginBottom: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 24, elevation: 3 },
  infoTitle: { fontSize: 14, color: '#64748B', fontWeight: 'bold' },
  infoValue: { fontSize: 20, fontWeight: 'bold', color: '#0B579D', marginVertical: 4 },
  infoDesc: { fontSize: 13, color: '#10B981', fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 14, elevation: 2 },
  menuIcon: { fontSize: 28 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  menuDesc: { fontSize: 13, color: '#64748B', marginTop: 2 },
  chevron: { fontSize: 22, color: '#94A3B8', fontWeight: 'bold' },
  noticeBox: { marginTop: 10, backgroundColor: '#E0F2FE', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  noticeText: { fontSize: 13, color: '#0369A1', lineHeight: 18 },
});