import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Screens Auth (Otentikasi & Setup)
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SetupScreen from './src/screens/auth/SetupScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Import Navigasi Utama Aplikasi
import NavigationBar from './src/components/NavigationBar';

// Import Screen Tambahan Warga / Pendukung
import GuestQrScreen from './src/screens/warga/GuestQrScreen';
import RondaScreen from './src/screens/warga/RondaScreen';
import MarketplaceScreen from './src/screens/warga/MarketplaceScreen';
import AssetRtScreen from './src/screens/warga/AssetRtScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [tenantCode, setTenantCode] = useState(null);
  const [user, setUser] = useState(null);

  // 🟢 Fungsi Logout Utama: Mengosongkan data user agar aplikasi kembali ke halaman Login
  const handleLogout = () => {
    setUser(null);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isStarted ? (
            <Stack.Screen name="Welcome">
              {(props) => <WelcomeScreen {...props} onStart={() => setIsStarted(true)} />}
            </Stack.Screen>
          ) : !tenantCode ? (
            <Stack.Screen name="Setup">
              {(props) => (
                <SetupScreen
                  {...props}
                  onSetupComplete={(code) => setTenantCode(code)}
                />
              )}
            </Stack.Screen>
          ) : !user ? (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen
                    {...props}
                    tenantCode={tenantCode}
                    onLoginSuccess={(userData) => setUser(userData)}
                    onChangeTenant={() => setTenantCode(null)}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          ) : (
            <>
              {/* MainApp merender NavigationBar dan meneruskan fungsi onLogout */}
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

              {/* Stack Screen Pendukung untuk Fitur-Fitur Khusus */}
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