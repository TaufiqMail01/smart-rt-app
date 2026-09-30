import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SetupScreen from './src/screens/SetupScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import NavigationBar from './src/components/NavigationBar';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [tenantCode, setTenantCode] = useState(null);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user || !tenantCode ? (
          // ==================== ALUR UN-AUTHENTICATED ====================
          <>
            <Stack.Screen name="Setup">
              {(props) => (
                <SetupScreen
                  {...props}
                  onSetupComplete={(selectedTenantCode) => {
                    setTenantCode(selectedTenantCode);
                    props.navigation.navigate('Login', { tenantCode: selectedTenantCode });
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Login">
              {(props) => (
                <LoginScreen
                  {...props}
                  onLoginSuccess={(userData) => {
                    setUser(userData);
                  }}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // ==================== ALUR AUTHENTICATED ====================
          <>
            {/* Main Tabs (Beranda, Layanan, Keuangan, Aduan, Profil) */}
            <Stack.Screen name="MainApp">
              {(props) => (
                <NavigationBar
                  {...props}
                  user={user}
                  tenantCode={tenantCode}
                  onLogout={() => {
                    setUser(null);
                    setTenantCode(null);
                  }}
                />
              )}
            </Stack.Screen>

            {/* Dashboard Admin RT (Bisa diakses dari ProfileScreen) */}
            <Stack.Screen name="AdminDashboard">
              {(props) => (
                <AdminDashboardScreen
                  {...props}
                  user={user}
                  tenantCode={tenantCode}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}