import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import HomeScreen from '../screens/warga/HomeScreen';
import ReportScreen from '../screens/warga/ReportScreen';
import SecurityDashboardScreen from '../screens/satpam/SecurityDashboardScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

export default function NavigationBar({ user, tenantCode, navigation, onLogout }) {
  const userRole = user?.role ? user.role.toLowerCase().trim() : 'warga';

  // Jika role satpam, default tab aktifnya adalah 'SatpamHome' (atau Anda bisa sesuaikan)
  const [activeTab, setActiveTab] = useState(
    userRole === 'satpam' ? 'SatpamHome' : userRole === 'admin_rt' ? 'Admin' : 'Home'
  );

  // Fungsi Keluar Langsung
  const handleDirectLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      case 'Aduan':
        return <ReportScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      case 'SatpamHome':
        // Di sini kita arahkan ke SecurityDashboardScreen, di mana di dalamnya sudah ada sub-tab Beranda & Pos Jaga
        return <SecurityDashboardScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      case 'Admin':
        return <AdminDashboardScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      default:
        return userRole === 'satpam' ? (
          <SecurityDashboardScreen user={user} tenantCode={tenantCode} navigation={navigation} />
        ) : (
          <HomeScreen user={user} tenantCode={tenantCode} navigation={navigation} />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Container Layar Utama */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>

      {/* Bilah Navigasi Bawah */}
      <SafeAreaView style={styles.safeAreaNav} edges={['bottom']}>
        <View style={styles.navBar}>
          
          {userRole === 'satpam' ? (
            // Navigasi Bawah Khusus Satpam (Beranda & Pos Jaga)
            <>
              <TouchableOpacity 
                style={styles.navItem} 
                onPress={() => setActiveTab('SatpamHome')}
                activeOpacity={0.7}
              >
                <Text style={[styles.navIcon, activeTab === 'SatpamHome' && styles.activeText]}>🛡️</Text>
                <Text style={[styles.navLabel, activeTab === 'SatpamHome' && styles.activeText]}>Beranda</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Navigasi Warga / Admin
            <>
              <TouchableOpacity 
                style={styles.navItem} 
                onPress={() => setActiveTab('Home')}
                activeOpacity={0.7}
              >
                <Text style={[styles.navIcon, activeTab === 'Home' && styles.activeText]}>🏠</Text>
                <Text style={[styles.navLabel, activeTab === 'Home' && styles.activeText]}>Beranda</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.navItem} 
                onPress={() => setActiveTab('Aduan')}
                activeOpacity={0.7}
              >
                <Text style={[styles.navIcon, activeTab === 'Aduan' && styles.activeText]}>📢</Text>
                <Text style={[styles.navLabel, activeTab === 'Aduan' && styles.activeText]}>Aduan</Text>
              </TouchableOpacity>

              {userRole === 'admin_rt' && (
                <TouchableOpacity 
                  style={styles.navItem} 
                  onPress={() => setActiveTab('SatpamHome')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navIcon, activeTab === 'SatpamHome' && styles.activeText]}>📷</Text>
                  <Text style={[styles.navLabel, activeTab === 'SatpamHome' && styles.activeText]}>Pos Jaga</Text>
                </TouchableOpacity>
              )}

              {userRole === 'admin_rt' && (
                <TouchableOpacity 
                  style={styles.navItem} 
                  onPress={() => setActiveTab('Admin')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.navIcon, activeTab === 'Admin' && styles.activeText]}>👑</Text>
                  <Text style={[styles.navLabel, activeTab === 'Admin' && styles.activeText]}>Admin RT</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Tombol Keluar / Logout */}
          <TouchableOpacity 
            style={styles.navItem} 
            onPress={handleDirectLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.navIcon}>🚪</Text>
            <Text style={styles.navLabelLogout}>Keluar</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA' 
  },
  screenContainer: { 
    flex: 1 
  },
  safeAreaNav: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    elevation: 25,
    zIndex: 9999,
  },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: { 
    alignItems: 'center', 
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 6,
  },
  navIcon: { 
    fontSize: 22, 
    marginBottom: 2 
  },
  navLabel: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#64748B' 
  },
  navLabelLogout: { 
    fontSize: 10, 
    fontWeight: 'bold', 
    color: '#DC2626' 
  },
  activeText: { 
    color: '#0B579D' 
  },
});