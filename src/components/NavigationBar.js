import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import HomeScreen from '../screens/warga/HomeScreen';
import ReportScreen from '../screens/warga/ReportScreen';
import SatpamScannerScreen from '../screens/satpam/SatpamScannerScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';

export default function NavigationBar({ user, tenantCode, navigation, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');
  const userRole = user?.role || 'warga';

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      case 'Aduan':
        return <ReportScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      case 'Satpam':
        return <SatpamScannerScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      case 'Admin':
        return <AdminDashboardScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
      default:
        return <HomeScreen user={user} tenantCode={tenantCode} navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Home')}>
          <Text style={[styles.navIcon, activeTab === 'Home' && styles.activeText]}>🏠</Text>
          <Text style={[styles.navLabel, activeTab === 'Home' && styles.activeText]}>Beranda</Text>
        </TouchableOpacity>

        {userRole !== 'satpam' && (
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Aduan')}>
            <Text style={[styles.navIcon, activeTab === 'Aduan' && styles.activeText]}>📢</Text>
            <Text style={[styles.navLabel, activeTab === 'Aduan' && styles.activeText]}>Aduan</Text>
          </TouchableOpacity>
        )}

        {(userRole === 'satpam' || userRole === 'admin_rt') && (
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Satpam')}>
            <Text style={[styles.navIcon, activeTab === 'Satpam' && styles.activeText]}>📷</Text>
            <Text style={[styles.navLabel, activeTab === 'Satpam' && styles.activeText]}>Pos Jaga</Text>
          </TouchableOpacity>
        )}

        {userRole === 'admin_rt' && (
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('Admin')}>
            <Text style={[styles.navIcon, activeTab === 'Admin' && styles.activeText]}>🛡️</Text>
            <Text style={[styles.navLabel, activeTab === 'Admin' && styles.activeText]}>Admin RT</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.navItem} onPress={onLogout}>
          <Text style={styles.navIcon}>🚪</Text>
          <Text style={styles.navLabel}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  screenContainer: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    justifyContent: 'space-around',
    elevation: 8,
  },
  navItem: { alignItems: 'center', flex: 1 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 10, fontWeight: 'bold', color: '#64748B' },
  activeText: { color: '#0B579D' },
});