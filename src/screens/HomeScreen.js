import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';

const { width } = Dimensions.get('window');

// ============================================================================
// 🛠️ DATA DINAMIS / BISA DIBONGKAR PASANG
// ============================================================================

const USER_DATA = {
  name: 'Pak Taufiq',
  block: 'Blok A No. 12',
};

const ANNOUNCEMENTS_DATA = [
  {
    id: '1',
    title: 'KERJA BAKTI MINGGU INI',
    desc: 'Bergabunglah untuk membersihkan lingkungan kita.\nJam 07:00 WIB.',
    imageIcon: '🧹',
  },
  {
    id: '2',
    title: 'PENARIKAN IURAN RT',
    desc: 'Batas akhir pembayaran iuran bulanan tanggal 10 bulan ini.',
    imageIcon: '💳',
  },
  {
    id: '3',
    title: 'RAPAT WARGA BULANAN',
    desc: 'Di balai RT hari Sabtu malam jam 19:30 WIB.',
    imageIcon: '📢',
  },
];

const QUICK_MENUS_DATA = [
  {
    id: '1',
    title: 'IZIN TAMU\nQR',
    icon: '🔳',
    action: () => alert('Buka Izin Tamu QR'),
  },
  {
    id: '2',
    title: 'JADWAL\nRONDA',
    icon: '🗓️',
    action: () => alert('Buka Jadwal Ronda'),
  },
  {
    id: '3',
    title: 'LAPAK\nWARGA',
    icon: '🏪',
    action: () => alert('Buka Lapak Warga'),
  },
  {
    id: '4',
    title: 'KONTAK\nRT',
    icon: '📞',
    action: () => alert('Buka Kontak RT'),
  },
];

// ============================================================================
// 📱 KOMPONEN UTAMA UI
// ============================================================================

export default function HomeScreen() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: '32°C', icon: '⛅' });

  // State & Ref untuk Pengaman Tombol SOS (Tahan 3 Detik)
  const [isHoldingSos, setIsHoldingSos] = useState(false);
  const sosTimerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // 1. Timer Real-time Jam Digital
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Fetch Weather API Real-time (Open-Meteo)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-6.2088&longitude=106.8456&current_weather=true'
        );
        const data = await response.json();
        if (data && data.current_weather) {
          const temp = `${Math.round(data.current_weather.temperature)}°C`;
          setWeather({ temp, icon: '⛅' });
        }
      } catch (e) {
        console.log('Error fetching weather:', e);
      }
    };
    fetchWeather();
  }, []);

  // Format Jam & Tanggal
  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Handler Scroll Slider Pengumuman
  const handleScroll = (event) => {
    const slide = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeSlide) {
      setActiveSlide(slide);
    }
  };

  // ============================================================================
  // 🚨 LOGIKA PENGAMAN TOMBOL SOS (TAHAN 3 DETIK)
  // ============================================================================

  const handleSosPressIn = () => {
    setIsHoldingSos(true);

    // Jalankan animasi progress 3 detik
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    // Jalankan timer 3 detik
    sosTimerRef.current = setTimeout(() => {
      triggerEmergencyAlert();
      resetSosButton();
    }, 3000);
  };

  const handleSosPressOut = () => {
    if (sosTimerRef.current) {
      clearTimeout(sosTimerRef.current);
    }
    resetSosButton();
  };

  const resetSosButton = () => {
    setIsHoldingSos(false);
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  };

  const triggerEmergencyAlert = () => {
    Alert.alert(
      '🚨 SINYAL DARURAT TERKIRIM!',
      'Lokasi dan koordinat rumah Anda telah dikirimkan ke Pos Satpam dan Pengurus RT.',
      [{ text: 'OK', style: 'destructive' }]
    );
  };

  // Interpolasi lebar bar indikator penekanan SOS
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. HEADER GRADIENT (BIRU KE HIJAU) */}
        <View style={styles.headerBackground}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.mainTitle}>Beranda</Text>
              <Text style={styles.subGreeting}>
                Halo, <Text style={styles.userName}>{USER_DATA.name}</Text> | {USER_DATA.block}
              </Text>
            </View>

            {/* WIDGET CUACA */}
            <View style={styles.weatherBox}>
              <Text style={styles.weatherIcon}>{weather.icon}</Text>
              <View>
                <Text style={styles.weatherTemp}>{weather.temp}</Text>
                <Text style={styles.timeText}>{formattedTime} WIB</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 2. SECTION PENGUMUMAN RT */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>PENGUMUMAN RT</Text>
          <View style={styles.arrowNavigation}>
            <Text style={styles.arrowText}>‹   ›</Text>
          </View>
        </View>

        {/* CAROUSEL SLIDER PENGUMUMAN */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.carouselContainer}
        >
          {ANNOUNCEMENTS_DATA.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <View style={styles.illustrationBox}>
                <Text style={styles.illustrationIcon}>{item.imageIcon}</Text>
              </View>
              <View style={styles.announcementTextBox}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* DOTS INDICATOR */}
        <View style={styles.dotsRow}>
          {ANNOUNCEMENTS_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlide === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* 3. GRID MENU AKSES CEPAT (4 TOMBOL) */}
        <View style={styles.gridContainer}>
          {QUICK_MENUS_DATA.map((menu) => (
            <TouchableOpacity key={menu.id} style={styles.menuCard} onPress={menu.action}>
              <Text style={styles.menuIcon}>{menu.icon}</Text>
              <Text style={styles.menuLabel}>{menu.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. CARD TOMBOL DARURAT (SOS) DENGAN PENGAMAN TAHAN 3 DETIK */}
        <View style={styles.sosCardContainer}>
          <View style={styles.sosCard}>
            
            {/* Tombol SOS */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={handleSosPressIn}
              onPressOut={handleSosPressOut}
              style={[
                styles.sosButtonCircle,
                isHoldingSos && styles.sosButtonCircleActive,
              ]}
            >
              <Text style={styles.sosButtonText}>SOS</Text>
            </TouchableOpacity>

            <View style={styles.sosTitleRow}>
              <Text style={styles.sosBellIcon}>🔔</Text>
              <Text style={styles.sosCardTitle}>TOMBOL DARURAT</Text>
            </View>

            <Text style={[styles.sosCardSubtitle, isHoldingSos && styles.sosSubtitleWarning]}>
              {isHoldingSos ? '⚠️ Tahan terus selama 3 detik...' : 'Tahan 3 detik untuk panggil bantuan'}
            </Text>

            {/* Indikator Visual Bar saat Ditekan */}
            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// 🎨 STYLING PRESISI
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  scrollContent: {
    paddingBottom: 25,
  },
  headerBackground: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subGreeting: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 4,
  },
  userName: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  weatherIcon: {
    fontSize: 22,
    marginRight: 6,
  },
  weatherTemp: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  timeText: {
    color: '#E2E8F0',
    fontSize: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  arrowNavigation: {
    paddingHorizontal: 4,
  },
  arrowText: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: 'bold',
  },
  carouselContainer: {
    paddingLeft: 20,
  },
  announcementCard: {
    width: width - 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  illustrationBox: {
    width: 80,
    height: 80,
    backgroundColor: '#E0F2FE',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  illustrationIcon: {
    fontSize: 36,
  },
  announcementTextBox: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  announcementDesc: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#0284C7',
  },
  dotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuCard: {
    width: '22%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 13,
  },
  sosCardContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  sosButtonCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFE4E6',
    marginBottom: 10,
  },
  sosButtonCircleActive: {
    backgroundColor: '#BE123C',
    borderColor: '#FECDD3',
    transform: [{ scale: 1.05 }],
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 22,
  },
  sosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosBellIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sosCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    letterSpacing: 0.5,
  },
  sosCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sosSubtitleWarning: {
    color: '#E11D48',
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 4,
    width: '100%',
    backgroundColor: '#F1F5F9',
    marginTop: 12,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E11D48',
  },
});