import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

import HomeScreen from '../screens/warga/HomeScreen';
import ReportScreen from '../screens/warga/ReportScreen';
import RondaScreen from '../screens/warga/RondaScreen';
import MarketplaceScreen from '../screens/warga/MarketplaceScreen';

export default function NavigationBar({ user, tenantCode, onLogout }) {
  const [activeTab, setActiveTab] = useState('Home');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeScreen user={user} tenantCode={tenantCode} onLogout={onLogout} />;
      case 'Report':
        return <ReportScreen user={user} tenantCode={tenantCode} />;
      case 'Ronda':
        return <RondaScreen />;
      case 'Marketplace':
        return <MarketplaceScreen />;
      default:
        return <HomeScreen user={user} tenantCode={tenantCode} onLogout={onLogout} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screenContainer}>{renderScreen()}</View>
      <View style={styles.navBar}>
        <TouchableOpacity style={[styles.navItem, activeTab === 'Home' && styles.navActive]} onPress={() => setActiveTab('Home')}>
          <Text style={styles.navText}>🏠 Beranda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, activeTab === 'Report' && styles.navActive]} onPress={() => setActiveTab('Report')}>
          <Text style={styles.navText}>📢 Laporan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, activeTab === 'Ronda' && styles.navActive]} onPress={() => setActiveTab('Ronda')}>
          <Text style={styles.navText}>🛡️ Ronda</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, activeTab === 'Marketplace' && styles.navActive]} onPress={() => setActiveTab('Marketplace')}>
          <Text style={styles.navText}>🛒 Pasar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  screenContainer: { flex: 1 },
  navBar: { height: 65, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 8 },
  navItem: { flex: 1, height: '100%', justifyContent: 'center', alignItems: 'center' },
  navActive: { borderTopWidth: 3, borderTopColor: '#0B579D', backgroundColor: '#F8FAFC' },
  navText: { fontSize: 12, fontWeight: 'bold', color: '#334155' },
});