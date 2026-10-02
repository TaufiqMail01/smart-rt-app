import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import Screens Auth
import WelcomeScreen from './src/screens/auth/WelcomeScreen';
import SetupScreen from './src/screens/auth/SetupScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import NavigationBar from './src/components/NavigationBar';

// Import Screens Warga
import GuestQrScreen from './src/screens/warga/GuestQrScreen';
import RondaScreen from './src/screens/warga/RondaScreen';
import MarketplaceScreen from './src/screens/warga/MarketplaceScreen';
import AssetRtScreen from './src/screens/warga/AssetRtScreen';
import ReportScreen from './src/screens/warga/ReportScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [tenantCode, setTenantCode] = useState(null);
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setTenantCode(null);
    setIsStarted(false);
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
              <Stack.Screen name="Register">
                {(props) => <RegisterScreen {...props} tenantCode={tenantCode} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              {/* Main App dengan Bottom Navigation Bar */}
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

              {/* Rute Layar Tambahan Warga */}
              <Stack.Screen name="GuestQr">
                {(props) => <GuestQrScreen {...props} user={user} tenantCode={tenantCode} />}
              </Stack.Screen>
              <Stack.Screen name="Ronda">
                {(props) => <RondaScreen {...props} user={user} tenantCode={tenantCode} />}
              </Stack.Screen>
              <Stack.Screen name="Marketplace">
                {(props) => <MarketplaceScreen {...props} user={user} tenantCode={tenantCode} />}
              </Stack.Screen>
              <Stack.Screen name="AssetRt">
                {(props) => <AssetRtScreen {...props} user={user} tenantCode={tenantCode} />}
              </Stack.Screen>
              <Stack.Screen name="Report">
                {(props) => <ReportScreen {...props} user={user} tenantCode={tenantCode} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}