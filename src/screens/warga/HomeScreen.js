import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { supabase } from '../../config/supabase';

const { width } = Dimensions.get('window');

export default function HomeScreen({ user, tenantCode, navigation }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // 1. STATE WADAH DATA DARI DATABASE (Real-time DB Ready)
  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const [personalKas, setPersonalKas] = useState(null);
  const [kasRt, setKasRt] = useState(null);
  const [contacts, setContacts] = useState([]);

  // 🟢 State Statistik Lingkungan (KK + Estimasi Total Warga Jiwa)
  const [statsRt, setStatsRt] = useState({ 
    totalKk: 0, 
    totalWargaJiwa: 0, 
    onlineUsers: 1 
  });

  // State Animasi & SOS
  const [isHoldingSos, setIsHoldingSos] = useState(false);
  const [lastSosSent, setLastSosSent] = useState(null);
  const sosTimerRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Format Nama Pengguna
  const rawName = user?.name || 'Warga';
  const displayName = rawName.toLowerCase().startsWith('pak') || rawName.toLowerCase().startsWith('ibu')
    ? rawName
    : `Pak/Bu ${rawName}`;

  const handleNavigate = (screenName) => {
    if (navigation?.getParent && navigation.getParent()) {
      navigation.getParent().navigate(screenName);
    } else if (navigation?.navigate) {
      navigation.navigate(screenName);
    }
  };

const QUICK_MENUS = [
    { id: '1', title: 'TAMU WAJIB\nLAPOR', icon: '🏠', action: () => handleNavigate('GuestQr') },
    { id: '2', title: 'JADWAL\nRONDA', icon: '🗓️', action: () => handleNavigate('Ronda') },
    { id: '3', title: 'LAPAK\nWARGA', icon: '🏪', action: () => handleNavigate('Marketplace') },
    { id: '4', title: 'ASSET RT\nINVENTARIS', icon: '⛺', action: () => handleNavigate('AssetRt') },
  ];

  // 🔴 2. FETCH WADAH DATA SUPABASE REAL-TIME
  const fetchAllHomeData = async () => {
    setLoadingAnnouncements(true);
    try {
      if (supabase) {
        const currentTenant = tenantCode || 'RT006-RW012-KEDIP';

        // Fetch Pengumuman
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .eq('tenant_code', currentTenant)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (annData) setAnnouncements(annData);

        // Fetch Total KK Terdaftar & Total Warga Jiwa
        const { data: residentData, count: kkCount } = await supabase
          .from('residents')
          .select('total_family_members', { count: 'exact' })
          .eq('tenant_code', currentTenant);

        const calculatedKk = kkCount || 0;
        // Hitung total jiwa dari kolom database / estimasi rata-rata keluarga
        const calculatedJiwa = residentData && residentData.length > 0
          ? residentData.reduce((acc, curr) => acc + (curr.total_family_members || 4), 0)
          : calculatedKk * 4;

        setStatsRt((prev) => ({ 
          ...prev, 
          totalKk: calculatedKk,
          totalWargaJiwa: calculatedJiwa,
        }));

        // Fetch Rekap Kas RT
        const { data: kasData } = await supabase
          .from('rt_finances')
          .select('*')
          .eq('tenant_code', currentTenant)
          .maybeSingle();

        if (kasData) setKasRt(kasData);

        // Fetch Status Kas User
        if (user?.id) {
          const { data: userKas } = await supabase
            .from('user_payments')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (userKas) setPersonalKas(userKas);
        }

        // Fetch Kontak Pengurus
        const { data: contactData } = await supabase
          .from('rt_contacts')
          .select('*')
          .eq('tenant_code', currentTenant);

        if (contactData) setContacts(contactData);
      }
    } catch (err) {
      console.log('Error fetching home data:', err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  // 🔴 3. PRESENCE REAL-TIME (WARGA ONLINE)
  useEffect(() => {
    fetchAllHomeData();

    if (!supabase) return;
    const currentTenant = tenantCode || 'RT006-RW012-KEDIP';

    // Presence Warga Online
    const presenceChannel = supabase.channel(`online_${currentTenant}`, {
      config: { presence: { key: user?.id || `anon-${Math.random()}` } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const count = Object.keys(state).length;
        setStatsRt((prev) => ({ ...prev, onlineUsers: count > 0 ? count : 1 }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_name: displayName, online_at: new Date().toISOString() });
        }
      });

    // Listener Realtime Pengumuman
    const annSub = supabase
      .channel('announcements_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        fetchAllHomeData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(presenceChannel);
      supabase.removeChannel(annSub);
    };
  }, [tenantCode, user]);

  // Pull-to-Refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllHomeData();
    setRefreshing(false);
  };

  // Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const handleScroll = (event) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  // SOS Handler
  const handleSosPressIn = () => {
    setIsHoldingSos(true);
    Animated.timing(progressAnim, { toValue: 1, duration: 3000, useNativeDriver: false }).start();
    sosTimerRef.current = setTimeout(() => {
      triggerEmergencyAlert();
      resetSosButton();
    }, 3000);
  };

  const handleSosPressOut = () => {
    if (sosTimerRef.current) clearTimeout(sosTimerRef.current);
    resetSosButton();
  };

  const resetSosButton = () => {
    setIsHoldingSos(false);
    Animated.timing(progressAnim, { toValue: 0, duration: 150, useNativeDriver: false }).start();
  };

  const triggerEmergencyAlert = async () => {
    let currentLat = null;
    let currentLong = null;

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        currentLat = loc.coords.latitude;
        currentLong = loc.coords.longitude;
      }
    } catch (e) {
      console.log('Location SOS error:', e);
    }

    const payload = {
      user_name: displayName,
      block: user?.block || '-',
      tenant_id: tenantCode || 'RT006-RW012-KEDIP',
      latitude: currentLat,
      longitude: currentLong,
      created_at: new Date().toISOString(),
    };

    try {
      if (supabase) {
        await supabase.from('emergency_alerts').insert([payload]);
      }
    } catch (err) {
      console.log('Supabase SOS error:', err);
    }

    const nowFormatted = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setLastSosSent(nowFormatted);

    Alert.alert(
      '🚨 SINYAL DARURAT TERKIRIM!',
      `Sinyal darurat dari ${payload.user_name} (${payload.block}) telah diteruskan secara Real-Time ke Pos Satpam & Pengurus RT.`,
      [{ text: 'OK', style: 'destructive' }]
    );
  };

  const progressWidth = progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
      >
        {/* 1. HEADER UTAMA */}
        <View style={styles.headerBackground}>
          <View style={styles.headerTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mainTitle}>Beranda Warga</Text>
              <Text style={styles.subGreeting}>
                Halo, <Text style={styles.userName}>{displayName}</Text>
              </Text>
              <Text style={styles.userBlockText}>📍 {user?.block || 'Blok A No. 12'}</Text>
            </View>

            <View style={styles.weatherBox}>
              <Text style={styles.weatherIcon}>⛅</Text>
              <View>
                <Text style={styles.weatherTemp}>31°C</Text>
                <Text style={styles.timeText}>{formattedTime} WIB</Text>
              </View>
            </View>
          </View>

          <View style={styles.tenantInfoChip}>
            <Text style={styles.tenantInfoText}>Wilayah: <Text style={styles.tenantBold}>{tenantCode || 'RT006-RW012-KEDIP'}</Text></Text>
          </View>
        </View>

        {/* 2. STATISTIK RT + JUMLAH WARGA TERDAFTAR BERDASARKAN KK */}
        <View style={styles.statsRowContainer}>
          {/* Box Total KK Terdaftar */}
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🏡</Text>
            <Text style={styles.statValue}>{statsRt.totalKk} KK</Text>
            <Text style={styles.statLabel}>Terdaftar</Text>
          </View>

          {/* Box Total Jiwa / Warga */}
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{statsRt.totalWargaJiwa} Jiwa</Text>
            <Text style={styles.statLabel}>Total Warga</Text>
          </View>

          {/* Box Warga Online */}
          <View style={[styles.statBox, styles.statBoxOnline]}>
            <View style={styles.onlineBadgeRow}>
              <View style={styles.greenDot} />
              <Text style={styles.statIcon}>📱</Text>
            </View>
            <Text style={[styles.statValue, { color: '#15803D' }]}>{statsRt.onlineUsers} Warga</Text>
            <Text style={styles.statLabel}>Online</Text>
          </View>
        </View>

        {/* 3. WADAH PENGUMUMAN REAL-TIME */}
        {loadingAnnouncements ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#0284C7" />
            <Text style={styles.loadingText}>Memuat pengumuman terbaru...</Text>
          </View>
        ) : announcements && announcements.length > 0 ? (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>📢 PENGUMUMAN LINGKUNGAN</Text>
            </View>

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              style={styles.carouselContainer}
            >
              {announcements.map((item) => (
                <View key={item.id} style={styles.announcementCard}>
                  <View style={styles.illustrationBox}>
                    <Text style={styles.illustrationIcon}>{item.image_icon || '📢'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.announcementTitle}>{item.title}</Text>
                    <Text style={styles.announcementDesc}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.dotsRow}>
              {announcements.map((_, index) => (
                <View key={index} style={[styles.dot, activeSlide === index ? styles.dotActive : styles.dotInactive]} />
              ))}
            </View>
          </>
        ) : null}

        {/* 4. MENU CEPAT UTAMA */}
        <View style={styles.gridContainer}>
          {QUICK_MENUS.map((menu) => (
            <TouchableOpacity key={menu.id} style={styles.menuCard} onPress={menu.action} activeOpacity={0.7}>
              <Text style={styles.menuIcon}>{menu.icon}</Text>
              <Text style={styles.menuLabel}>{menu.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. WADAH STATUS IURAN KAS WARGA */}
        {personalKas && (
          <View style={styles.kasStatusContainer}>
            <View style={[styles.kasStatusCard, personalKas.is_paid ? styles.kasStatusPaidCard : styles.kasStatusUnpaidCard]}>
              <View style={styles.kasStatusLeft}>
                <Text style={styles.statusIcon}>{personalKas.is_paid ? '✅' : '⚠️'}</Text>
                <View>
                  <Text style={personalKas.is_paid ? styles.kasStatusPaidTitle : styles.kasStatusUnpaidTitle}>
                    {personalKas.is_paid ? 'IURAN LUNAS' : 'BELUM BAYAR IURAN'}
                  </Text>
                  <Text style={personalKas.is_paid ? styles.kasStatusPaidDesc : styles.kasStatusUnpaidDesc}>
                    {personalKas.is_paid ? `Periode ${personalKas.period}` : `Tagihan ${personalKas.period}: ${personalKas.amount}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 6. WADAH REKAP TRANSPARANSI KAS RT */}
        {kasRt && (
          <View style={styles.transparencyContainer}>
            <View style={styles.mainKasCard}>
              <View style={styles.kasHeaderRow}>
                <Text style={styles.kasLabel}>Saldo Kas RT ({kasRt.period || 'Periode Ini'})</Text>
                <Text style={styles.kasBadge}>Update DB</Text>
              </View>
              <Text style={styles.kasAmount}>{kasRt.total_saldo || 'Rp 0'}</Text>
              <View style={styles.kasDivider} />
              <View style={styles.kasDetailRow}>
                <View>
                  <Text style={styles.kasSubTitle}>Pemasukan</Text>
                  <Text style={styles.kasIncome}>{kasRt.income || 'Rp 0'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.kasSubTitle}>Pengeluaran</Text>
                  <Text style={styles.kasExpense}>{kasRt.expense || 'Rp 0'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 7. WADAH KONTAK PENGURUS LINGKUNGAN */}
        {contacts && contacts.length > 0 && (
          <View style={styles.contactContainer}>
            {contacts.map((c) => (
              <View key={c.id} style={styles.contactCard}>
                <View style={styles.contactLeft}>
                  <Text style={styles.contactAvatar}>👨‍💼</Text>
                  <View>
                    <Text style={styles.contactName}>{c.name}</Text>
                    <Text style={styles.contactRole}>{c.role}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.btnWa} onPress={() => Alert.alert('Kontak', `Menghubungkan ke ${c.phone_number}`)}>
                  <Text style={styles.btnWaText}>💬 WA</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 8. CARD TOMBOL SOS DARURAT 3D */}
        <View style={styles.sosCardContainer}>
          <View style={styles.sosCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPressIn={handleSosPressIn}
              onPressOut={handleSosPressOut}
              style={[styles.sosButtonCircle3D, isHoldingSos && styles.sosButtonCircleActive]}
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

            {lastSosSent && (
              <Text style={styles.lastSosText}>✅ Sinyal darurat dikirim pukul {lastSosSent}</Text>
            )}

            <View style={styles.progressBarBackground}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  scrollContent: { paddingBottom: 40 },

  /* Header Utama */
  headerBackground: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 26,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 15,
  },
  headerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: 'bold' },
  subGreeting: { color: '#E2E8F0', fontSize: 15, marginTop: 4 },
  userName: { fontWeight: 'bold', color: '#FFFFFF' },
  userBlockText: { color: '#BAE6FD', fontSize: 13, marginTop: 2, fontWeight: '600' },

  weatherBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14 },
  weatherIcon: { fontSize: 24, marginRight: 6 },
  weatherTemp: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  timeText: { color: '#E2E8F0', fontSize: 11 },

  tenantInfoChip: { backgroundColor: 'rgba(255, 255, 255, 0.18)', marginTop: 14, paddingVertical: 6, paddingHorizontal: 14, borderRadius: 12, alignSelf: 'flex-start' },
  tenantInfoText: { color: '#E0F2FE', fontSize: 12 },
  tenantBold: { fontWeight: 'bold', color: '#FFFFFF' },

  /* Statistik RT & Presence */
  statsRowContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 },
  statBox: { width: '31%', backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 14, alignItems: 'center', elevation: 2 },
  statBoxOnline: { borderWidth: 1.5, borderColor: '#86EFAC', backgroundColor: '#F0FDF4' },
  onlineBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  greenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#16A34A', marginRight: 4 },
  statIcon: { fontSize: 22, marginBottom: 2 },
  statValue: { fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  statLabel: { fontSize: 10, color: '#64748B', marginTop: 2, fontWeight: '600' },

  /* Pengumuman */
  sectionHeaderRow: { paddingHorizontal: 20, marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', letterSpacing: 0.5 },
  loadingBox: { paddingHorizontal: 20, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  loadingText: { marginLeft: 10, fontSize: 13, color: '#64748B' },

  carouselContainer: { paddingLeft: 20 },
  announcementCard: { width: width - 56, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginRight: 14, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  illustrationBox: { width: 70, height: 70, backgroundColor: '#E0F2FE', borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  illustrationIcon: { fontSize: 36 },
  announcementTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  announcementDesc: { fontSize: 12, color: '#475569', lineHeight: 18 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 18 },
  dot: { height: 6, borderRadius: 3, marginHorizontal: 3 },
  dotActive: { width: 18, backgroundColor: '#0284C7' },
  dotInactive: { width: 6, backgroundColor: '#CBD5E1' },

  /* Menu Grid */
  gridContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  menuCard: { width: '22%', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 20, alignItems: 'center', elevation: 3 },
  menuIcon: { fontSize: 32, marginBottom: 8 },
  menuLabel: { fontSize: 11, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', lineHeight: 14 },

  /* Status Kas Personal */
  kasStatusContainer: { paddingHorizontal: 20, marginBottom: 18 },
  kasStatusCard: { borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  kasStatusUnpaidCard: { backgroundColor: '#FEF2F2', borderWidth: 1.5, borderColor: '#FECDD3' },
  kasStatusPaidCard: { backgroundColor: '#F0FDF4', borderWidth: 1.5, borderColor: '#BBF7D0' },
  kasStatusLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  statusIcon: { fontSize: 28, marginRight: 12 },
  kasStatusUnpaidTitle: { fontSize: 14, fontWeight: 'bold', color: '#991B1B' },
  kasStatusUnpaidDesc: { fontSize: 12, color: '#B91C1C', marginTop: 2 },
  kasStatusPaidTitle: { fontSize: 14, fontWeight: 'bold', color: '#166534' },
  kasStatusPaidDesc: { fontSize: 12, color: '#15803D', marginTop: 2 },

  /* Transparansi Kas RT */
  transparencyContainer: { paddingHorizontal: 20, marginBottom: 18 },
  mainKasCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18, elevation: 2 },
  kasHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kasLabel: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  kasBadge: { backgroundColor: '#E0F2FE', color: '#0284C7', fontSize: 11, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  kasAmount: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginTop: 4 },
  kasDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  kasDetailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  kasSubTitle: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold' },
  kasIncome: { fontSize: 13, fontWeight: 'bold', color: '#16A34A', marginTop: 2 },
  kasExpense: { fontSize: 13, fontWeight: 'bold', color: '#DC2626', marginTop: 2 },

  /* Kontak Pengurus */
  contactContainer: { paddingHorizontal: 20, marginBottom: 22 },
  contactCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, marginBottom: 10 },
  contactLeft: { flexDirection: 'row', alignItems: 'center' },
  contactAvatar: { fontSize: 32, marginRight: 14 },
  contactName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  contactRole: { fontSize: 12, color: '#64748B', marginTop: 2 },
  btnWa: { backgroundColor: '#22C55E', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  btnWaText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },

  /* SOS Card 3D */
  sosCardContainer: { paddingHorizontal: 20, marginBottom: 10 },
  sosCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingVertical: 22, paddingHorizontal: 20, alignItems: 'center', elevation: 4 },
  sosButtonCircle3D: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#E11D48',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 6,
    borderBottomColor: '#BE123C',
    borderRightWidth: 2,
    borderRightColor: '#E11D48',
    elevation: 6,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    marginBottom: 12,
  },
  sosButtonCircleActive: { backgroundColor: '#BE123C', borderBottomWidth: 2 },
  sosButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 26, letterSpacing: 1 },
  sosTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sosBellIcon: { fontSize: 16, marginRight: 6 },
  sosCardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', letterSpacing: 0.5 },
  sosCardSubtitle: { fontSize: 12, color: '#64748B', marginTop: 4 },
  sosSubtitleWarning: { color: '#E11D48', fontWeight: 'bold' },
  lastSosText: { fontSize: 11, color: '#16A34A', fontWeight: 'bold', marginTop: 8 },
  progressBarBackground: { height: 5, width: '100%', backgroundColor: '#F1F5F9', marginTop: 14, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#E11D48' },
});