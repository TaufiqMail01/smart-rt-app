import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import ServicesScreen from '../screens/ServicesScreen';
import FinanceScreen from '../screens/FinanceScreen';
import ReportScreen from '../screens/ReportScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function NavigationBar({ user, tenantCode, onLogout }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0B579D',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => {
          let icon = '🏠';
          if (route.name === 'BERANDA') icon = '🏠';
          else if (route.name === 'LAYANAN') icon = '📄';
          else if (route.name === 'KEUANGAN') icon = '💳';
          else if (route.name === 'ADUAN') icon = '⚠️';
          else if (route.name === 'PROFIL') icon = '👤';

          return <Text style={{ fontSize: focused ? 20 : 18 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="BERANDA">
        {(props) => <HomeScreen {...props} user={user} tenantCode={tenantCode} />}
      </Tab.Screen>
      <Tab.Screen name="LAYANAN" component={ServicesScreen} />
      <Tab.Screen name="KEUANGAN" component={FinanceScreen} />
      <Tab.Screen name="ADUAN">
        {(props) => <ReportScreen {...props} user={user} tenantCode={tenantCode} />}
      </Tab.Screen>
      <Tab.Screen name="PROFIL">
        {(props) => (
          <ProfileScreen
            {...props}
            user={user}
            tenantCode={tenantCode}
            onLogout={onLogout}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tabBarLabel: {
    fontSize: 9,
    fontWeight: 'bold',
  },
});