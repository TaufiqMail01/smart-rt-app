import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';

export default function WelcomeScreen({ onStart }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />
      
      <View style={styles.content}>
        {/* Logo App Smart RT */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>🏠</Text>
          </View>
          <Text style={styles.appTitle}>SMART RT</Text>
          <Text style={styles.appSubtitle}>Sistem Manajemen & Keamanan Lingkungan Digital</Text>
        </View>

        {/* Tombol Panah Melingkar di Tengah */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.circleArrowButton} 
            activeOpacity={0.8}
            onPress={onStart}
          >
            <Text style={styles.arrowIcon}>➔</Text>
          </TouchableOpacity>
          <Text style={styles.buttonLabel}>Tap Untuk Mulai Masuk</Text>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Versi 1.0.0 • RT Digital Indonesia</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B579D',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 60,
  },
  appTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 12,
    color: '#BAE6FD',
    marginTop: 6,
    textAlign: 'center',
  },
  
  /* Styling Tombol Panah Melingkar */
  actionContainer: {
    alignItems: 'center',
  },
  circleArrowButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    borderWidth: 4,
    borderColor: '#38BDF8',
  },
  arrowIcon: {
    fontSize: 32,
    color: '#0B579D',
    fontWeight: 'bold',
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 14,
  },

  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#93C5FD',
    fontSize:10,
  },
});