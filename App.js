import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Auth & Setup Screens
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import CreateTenantScreen from './src/screens/auth/CreateTenantScreen';
import SetupScreen from './src/screens/auth/SetupScreen';

// Warga Features
import NavigationBar from './src/components/NavigationBar';
import GuestQrScreen from './src/screens/warga/GuestQrScreen';
import RondaScreen from './src/screens/warga/RondaScreen';
import MarketplaceScreen from './src/screens/warga/MarketplaceScreen';
import AssetRtScreen from './src/screens/warga/AssetRtScreen';

// Admin / Management Screens
import KetuaRtDashboardScreen from './src/screens/admin/KetuaRtDashboardScreen';
import VerifikasiWargaScreen from './src/screens/admin/VerifikasiWargaScreen';
import PengaturanRtScreen from './src/screens/admin/PengaturanRtScreen';
import FinanceScreen from './src/screens/admin/FinanceScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [tenantCode, setTenantCode] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = () => setUser(null);

  const userRole = user?.role;
  const isManagementOrStaff = [
    'super_admin', 
    'ketua_rt', 
    'sekretaris', 
    'bendahara', 
    'pengurus'
  ].includes(userRole);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {/* 1. Alur Awal: Welcome Screen */}
          {!isStarted ? (
            <Stack.Screen name="Welcome">
              {(props) => <WelcomeScreen {...props} onStart={() => setIsStarted(true)} />}
            </Stack.Screen>
          ) : !user ? (
            /* 2. Setelah Welcome, langsung ke Pilih Peran & Login (LoginScreen sudah ada pilihan 6 peran) */
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen 
                    {...props} 
                    tenantCode={tenantCode} 
                    onLoginSuccess={setUser} 
                    onChangeTenant={() => setTenantCode(null)} 
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="CreateTenant" component={CreateTenantScreen} />
              <Stack.Screen name="Setup" component={SetupScreen} />
            </>
          ) : isManagementOrStaff ? (
            /* 3. Panel Manajemen / Pengurus / Super Admin */
            <>
              <Stack.Screen name="KetuaRtDashboard">
                {(props) => (
                  <KetuaRtDashboardScreen 
                    {...props} 
                    route={{ params: { tenantCode, user } }} 
                    onLogout={handleLogout} 
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="VerifikasiWarga" component={VerifikasiWargaScreen} />
              <Stack.Screen name="PengaturanRt" component={PengaturanRtScreen} />
              <Stack.Screen name="Finance" component={FinanceScreen} />
            </>
          ) : (
            /* 4. Panel Warga */
            <>
              <Stack.Screen name="MainApp">
                {(props) => (
                  <NavigationBar 
                    {...props} 
                    user={user} 
                    tenantCode={tenantCode} 
                    onLogout={handleLogout} 
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="GuestQr" component={GuestQrScreen} />
              <Stack.Screen name="Ronda" component={RondaScreen} />
              <Stack.Screen name="Marketplace" component={MarketplaceScreen} />
              <Stack.Screen name="AssetRt" component={AssetRtScreen} />
            </>
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}