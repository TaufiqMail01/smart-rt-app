import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';

// Impor seluruh modul admin termasuk modul baru
import AdminHomeDashboard from './AdminHomeDashboard';
import AdminGlobalLogsScreen from './AdminGlobalLogsScreen';
import AdminWargaApprovalScreen from './AdminWargaApprovalScreen';
import AdminFinanceScreen from './AdminFinanceScreen';
import AdminSecurityScreen from './AdminSecurityScreen';
import AdminComplaintScreen from './AdminComplaintScreen';
import AdminAssetScreen from './AdminAssetScreen';
import AdminPatrolScreen from './AdminPatrolScreen';       // Modul Tambahan: Jadwal Ronda
import AdminLetterScreen from './AdminLetterScreen';       // Modul Tambahan: Surat Pengantar
import AdminDonationScreen from './AdminDonationScreen';   // Modul Tambahan: Donasi Warga

export default function AdminDashboardScreen({ user, tenantCode, navigation }) {
  const [activeAdminTab, setActiveAdminTab] = useState('home');

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Dashboard Admin RT */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Panel Admin & Pengurus RT</Text>
        <Text style={styles.headerSubtitle}>Klaster: {tenantCode || 'UMUM'} | Halo, {user?.name || 'Admin'}</Text>
      </View>

      {/* Navigasi Tab Admin (Horizontal Scroll) dengan Tambahan Menu */}
      <View style={styles.tabWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabContainer}
        >
          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'home' && styles.tabActive]}
            onPress={() => setActiveAdminTab('home')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'home' && styles.tabTextActive]}>Beranda</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'all_logs' && styles.tabActive]}
            onPress={() => setActiveAdminTab('all_logs')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'all_logs' && styles.tabTextActive]}>Semua Log</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'warga' && styles.tabActive]}
            onPress={() => setActiveAdminTab('warga')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'warga' && styles.tabTextActive]}>Warga</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'finance' && styles.tabActive]}
            onPress={() => setActiveAdminTab('finance')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'finance' && styles.tabTextActive]}>Keuangan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'security' && styles.tabActive]}
            onPress={() => setActiveAdminTab('security')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'security' && styles.tabTextActive]}>Keamanan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'patrol' && styles.tabActive]}
            onPress={() => setActiveAdminTab('patrol')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'patrol' && styles.tabTextActive]}>Jadwal Ronda</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'letters' && styles.tabActive]}
            onPress={() => setActiveAdminTab('letters')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'letters' && styles.tabTextActive]}>Surat Pengantar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'donations' && styles.tabActive]}
            onPress={() => setActiveAdminTab('donations')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'donations' && styles.tabTextActive]}>Donasi Warga</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'complaints' && styles.tabActive]}
            onPress={() => setActiveAdminTab('complaints')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'complaints' && styles.tabTextActive]}>Aduan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeAdminTab === 'assets' && styles.tabActive]}
            onPress={() => setActiveAdminTab('assets')}
          >
            <Text style={[styles.tabText, activeAdminTab === 'assets' && styles.tabTextActive]}>Aset RT</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Konten Utama Berdasarkan Tab yang Dipilih */}
      <View style={styles.contentContainer}>
        {activeAdminTab === 'home' && <AdminHomeDashboard tenantCode={tenantCode} user={user} />}
        {activeAdminTab === 'all_logs' && <AdminGlobalLogsScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'warga' && <AdminWargaApprovalScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'finance' && <AdminFinanceScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'security' && <AdminSecurityScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'patrol' && <AdminPatrolScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'letters' && <AdminLetterScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'donations' && <AdminDonationScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'complaints' && <AdminComplaintScreen tenantCode={tenantCode} />}
        {activeAdminTab === 'assets' && <AdminAssetScreen tenantCode={tenantCode} />}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA' 
  },
  headerCard: { 
    backgroundColor: '#0B579D', 
    padding: 12, 
    marginHorizontal: 16, 
    marginTop: 12, 
    marginBottom: 8, 
    borderRadius: 10, 
    elevation: 2 
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 2 
  },
  headerSubtitle: { 
    fontSize: 11, 
    color: '#E0F2FE' 
  },
  tabWrapper: {
    height: 44,
    marginBottom: 4,
  },
  tabContainer: { 
    paddingHorizontal: 16, 
    alignItems: 'center',
    gap: 8,
  },
  tabButton: { 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    backgroundColor: '#E2E8F0', 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    height: 32,
  },
  tabActive: { 
    backgroundColor: '#0B579D', 
    elevation: 2 
  },
  tabText: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#475569' 
  },
  tabTextActive: { 
    color: '#FFFFFF' 
  },
  contentContainer: { 
    flex: 1 
  },
});