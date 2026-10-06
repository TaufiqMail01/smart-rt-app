import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

import SecurityHomeDashboard from './SecurityHomeDashboard';
import GuestLogListScreen from './GuestLogListScreen';
import SecurityPatrolScreen from './SecurityPatrolScreen';

export default function SecurityDashboardScreen({ user, tenantCode, navigation }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Konten Utama Layar Berdasarkan Tab yang Dipilih */}
      <View style={styles.contentContainer}>
        {activeTab === 'home' && (
          <SecurityHomeDashboard user={user} tenantCode={tenantCode} setActiveTab={setActiveTab} />
        )}
        {activeTab === 'guest' && (
          <GuestLogListScreen user={user} tenantCode={tenantCode} navigation={navigation} />
        )}
        {activeTab === 'patrol' && (
          <SecurityPatrolScreen user={user} tenantCode={tenantCode} />
        )}
      </View>

      {/* Sub-Navigasi 3 Tab di Bagian Bawah */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={[styles.bottomTabItem, activeTab === 'home' && styles.bottomTabActive]}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bottomTabText, activeTab === 'home' && styles.bottomTextActive]}>🛡️ Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bottomTabItem, activeTab === 'guest' && styles.bottomTabActive]}
          onPress={() => setActiveTab('guest')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bottomTabText, activeTab === 'guest' && styles.bottomTextActive]}>📝 Buku Tamu</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.bottomTabItem, activeTab === 'patrol' && styles.bottomTabActive]}
          onPress={() => setActiveTab('patrol')}
          activeOpacity={0.8}
        >
          <Text style={[styles.bottomTabText, activeTab === 'patrol' && styles.bottomTextActive]}>🚶‍♂️ Patroli</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA',
    paddingTop: 8, 
  },
  contentContainer: { 
    flex: 1 
  },
  bottomTabBar: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    borderTopWidth: 1.5,
    borderTopColor: '#CBD5E1',
    elevation: 8,
    marginBottom: 4, 
  },
  bottomTabItem: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 10,
    marginHorizontal: 4,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  bottomTabActive: { 
    backgroundColor: '#0B579D',
    borderColor: '#0B579D'
  },
  bottomTabText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#475569' 
  },
  bottomTextActive: { 
    color: '#FFFFFF' 
  }
});