import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Share,
  Image,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabase';

export default function RondaScreen({ user, tenantCode, navigation }) {
  const [selectedDay, setSelectedDay] = useState('Sabtu');
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // State Absensi Warga Hari Ini
  const [attendance, setAttendance] = useState({
    isCheckedIn: false,
    checkInTime: null,
    checkOutTime: null,
    selfieUri: null,
    isPermission: false,
    permissionReason: '',
  });

  // Modal State untuk Izin & Tukar Jadwal
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [permissionType, setPermissionType] = useState('Sakit'); // 'Sakit', 'Dinas Luar', 'Lainnya'
  const [permissionNotes, setPermissionNotes] = useState('');
  const [swapTargetDay, setSwapTargetDay] = useState('Minggu');
  const [swapReason, setSwapReason] = useState('');

  // Wadah Data Jadwal Ronda & Riwayat Permohonan
  const [rondaSchedule, setRondaSchedule] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

  // Fetch Jadwal Ronda & Riwayat Permohonan Warga
  const fetchData = async (day) => {
    setLoading(true);
    try {
      if (supabase) {
        const currentTenant = tenantCode || 'RT006-RW012-KEDIP';
        
        // 1. Ambil Jadwal Ronda
        const { data: schedData, error: schedErr } = await supabase
          .from('ronda_schedules')
          .select('*')
          .eq('tenant_code', currentTenant)
          .eq('day_name', day)
          .order('created_at', { ascending: true });

        if (!schedErr && schedData) {
          setRondaSchedule(schedData);
        }

        // 2. Ambil Riwayat Pengajuan Izin / Tukar Jadwal Warga
        if (user?.id) {
          const { data: reqData } = await supabase
            .from('ronda_requests')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (reqData) {
            setMyRequests(reqData);
          }
        }
      }
    } catch (err) {
      console.log('Error fetch ronda data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedDay);
  }, [selectedDay, user]);

  // Otomatis Sudahi Ronda jika Lewat Jam 04:00 Pagi
  useEffect(() => {
    const checkAutoCheckOut = () => {
      if (attendance.isCheckedIn && !attendance.checkOutTime) {
        const currentHour = new Date().getHours();
        if (currentHour >= 4 && currentHour < 12) {
          const autoTime = '04:00 WIB';
          setAttendance((prev) => ({
            ...prev,
            checkOutTime: autoTime,
          }));

          if (supabase && user?.id) {
            supabase
              .from('ronda_attendances')
              .update({ check_out_at: new Date().toISOString(), status: 'COMPLETED_AUTO' })
              .eq('user_id', user.id);
          }

          Alert.alert('Otomatis Selesai', 'Waktu piket ronda telah berakhir (04:00 WIB). Status ronda Anda otomatis diselesaikan.');
        }
      }
    };

    const interval = setInterval(checkAutoCheckOut, 30000);
    return () => clearInterval(interval);
  }, [attendance, user]);

  // Mulai Ronda (Check-in Selfie)
  const handleCheckIn = async () => {
    let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
    if (locStatus !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin lokasi untuk memverifikasi posisi Pos Ronda.');
      return;
    }

    let { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin Kamera untuk foto selfie absensi.');
      return;
    }

    setCheckingIn(true);

    try {
      let currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });

      let photo = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!photo.canceled && photo.assets[0]?.uri) {
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const photoUri = photo.assets[0].uri;

        if (supabase && user?.id) {
          await supabase.from('ronda_attendances').insert([
            {
              user_id: user.id,
              tenant_code: tenantCode || 'RT006-RW012-KEDIP',
              user_name: user?.name || 'Warga',
              latitude: currentLocation.coords.latitude,
              longitude: currentLocation.coords.longitude,
              check_in_at: new Date().toISOString(),
              status: 'CHECKED_IN',
            },
          ]);
        }

        setAttendance({
          isCheckedIn: true,
          checkInTime: `${timeNow} WIB`,
          checkOutTime: null,
          selfieUri: photoUri,
          isPermission: false,
          permissionReason: '',
        });

        Alert.alert('✅ RONDA DIMULAI', 'Selamat bertugas menjaga keamanan lingkungan!');
      }
    } catch (err) {
      console.log('Check-in Error:', err);
      Alert.alert('Gagal', 'Proses mulai ronda gagal. Silakan coba kembali.');
    } finally {
      setCheckingIn(false);
    }
  };

  // Sudahi Ronda (Check-out)
  const handleCheckOut = async () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda ingin menyudahi piket ronda malam sekarang?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Sudahi Ronda',
          press: async () => {
            const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setAttendance((prev) => ({
              ...prev,
              checkOutTime: `${timeNow} WIB`,
            }));

            if (supabase && user?.id) {
              await supabase
                .from('ronda_attendances')
                .update({ check_out_at: new Date().toISOString(), status: 'COMPLETED' })
                .eq('user_id', user.id);
            }

            Alert.alert('🎉 TERIMA KASIH', 'Tugas ronda malam Anda telah selesai.');
          },
        },
      ]
    );
  };

  // 🔴 1. AJUKAN IZIN KETIDAKHADIRAN (ALUR SAMA: MASUK KE PENGURUS RT)
  const handleSubmitPermission = async () => {
    if (!permissionNotes.trim()) {
      Alert.alert('Peringatan', 'Harap tuliskan keterangan alasan tidak hadir.');
      return;
    }

    try {
      if (supabase && user?.id) {
        await supabase.from('ronda_requests').insert([
          {
            user_id: user.id,
            tenant_code: tenantCode || 'RT006-RW012-KEDIP',
            user_name: user?.name || 'Warga',
            request_type: 'IZIN',
            detail_info: `[${permissionType}] ${permissionNotes.trim()}`,
            status: 'PENDING_APPROVAL_RT',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      setAttendance((prev) => ({
        ...prev,
        isPermission: true,
        permissionReason: `[${permissionType}] ${permissionNotes.trim()}`,
      }));

      setShowPermissionModal(false);
      setPermissionNotes('');
      fetchData(selectedDay);

      Alert.alert(
        '📩 Laporan Izin Terkirim',
        'Permohonan izin ketidakhadiran telah diteruskan ke Pengurus RT & Pos Satpam untuk diverifikasi.',
        [{ text: 'Paham', style: 'default' }]
      );
    } catch (err) {
      console.log('Error submit permission:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim izin.');
    }
  };

  // 🔴 2. AJUKAN TUKAR JADWAL (ALUR SAMA: MASUK KE PENGURUS RT)
  const handleSubmitSwap = async () => {
    if (!swapTargetDay) {
      Alert.alert('Peringatan', 'Harap pilih hari tujuan pengganti.');
      return;
    }

    try {
      if (supabase && user?.id) {
        await supabase.from('ronda_requests').insert([
          {
            user_id: user.id,
            tenant_code: tenantCode || 'RT006-RW012-KEDIP',
            user_name: user?.name || 'Warga',
            request_type: 'TUKAR_JADWAL',
            detail_info: `Dari hari ${selectedDay} ke ${swapTargetDay}. Alasan: ${swapReason || 'Keperluan pribadi'}`,
            status: 'PENDING_APPROVAL_RT',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      setShowSwapModal(false);
      setSwapReason('');
      fetchData(selectedDay);

      Alert.alert(
        '📩 Permohonan Tukar Jadwal Terkirim',
        `Permohonan tukar jadwal (${selectedDay} ➔ ${swapTargetDay}) telah dikirim ke Ketua Keamanan & Pengurus RT untuk diverifikasi.`,
        [{ text: 'Paham', style: 'default' }]
      );
    } catch (err) {
      console.log('Error submit swap:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengajukan tukar jadwal.');
    }
  };

  const handleShareSchedule = async () => {
    try {
      await Share.share({
        message: `📢 JADWAL RONDA MALAM (${selectedDay.toUpperCase()})\nWilayah: ${tenantCode || 'RT006'}\n\nMari jaga keamanan lingkungan kita bersama. Tetap siaga di Pos Ronda Utama!`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FA" />

      {/* Header Bar Navigation 3D */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.btnBack3D}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.btnBackText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Jadwal & Absensi Ronda</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrapper}>
          
          {/* PANEL ABSENSI / IZIN KETIDAKHADIRAN */}
          <View style={styles.attendanceBoxCard}>
            <Text style={styles.attendanceCardTitle}>📍 Panel Kehadiran Ronda Malam</Text>
            <Text style={styles.attendanceCardSub}>
              Silakan foto selfie saat Anda berada di Pos Jaga, atau ajukan izin jika berhalangan.
            </Text>

            {!attendance.isCheckedIn && !attendance.isPermission ? (
              <View style={styles.actionRowContainer}>
                {/* TOMBOL MULAI RONDA */}
                <TouchableOpacity
                  style={[styles.btnCheckIn3D, { flex: 2, marginRight: 8 }]}
                  onPress={handleCheckIn}
                  activeOpacity={0.8}
                  disabled={checkingIn}
                >
                  {checkingIn ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.btnCheckInText}>📸 Mulai Ronda</Text>
                  )}
                </TouchableOpacity>

                {/* TOMBOL IZIN / TIDAK HADIR */}
                <TouchableOpacity
                  style={[styles.btnPermission3D, { flex: 1.2 }]}
                  onPress={() => setShowPermissionModal(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.btnPermissionText}>📝 Izin Hadir</Text>
                </TouchableOpacity>
              </View>
            ) : attendance.isPermission ? (
              <View style={styles.permissionBadgeBox}>
                <Text style={styles.permissionBadgeTitle}>⚠️ Status: Menunggu Verifikasi Pengurus (Izin)</Text>
                <Text style={styles.permissionBadgeSub}>{attendance.permissionReason}</Text>
              </View>
            ) : (
              <View style={styles.checkedInResultBox}>
                <View style={styles.selfieRow}>
                  {attendance.selfieUri && (
                    <Image source={{ uri: attendance.selfieUri }} style={styles.selfieImage} />
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.checkedInName}>👤 {user?.name || 'Warga'}</Text>
                    <Text style={styles.checkedInDetail}>🕒 Masuk: <Text style={styles.boldText}>{attendance.checkInTime}</Text></Text>
                    {attendance.checkOutTime && (
                      <Text style={styles.checkedInDetail}>🏠 Selesai: <Text style={styles.boldText}>{attendance.checkOutTime}</Text></Text>
                    )}
                  </View>
                </View>

                {!attendance.checkOutTime ? (
                  <TouchableOpacity style={styles.btnCheckOut3D} onPress={handleCheckOut} activeOpacity={0.8}>
                    <Text style={styles.btnCheckOutText}>🚪 Sudahi Ronda</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✅ TUGAS RONDA SELESAI</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* CARD CONTAINER UTAMA JADWAL */}
          <View style={styles.card}>
            <View style={styles.cardTitleBox}>
              <Text style={styles.cardIconHeader}>🛡️</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardHeaderTitle}>Jadwal Pos Ronda</Text>
                <Text style={styles.cardHeaderSub}>
                  Pilih hari untuk melihat daftar petugas ronda malam yang bertugas.
                </Text>
              </View>
              <TouchableOpacity style={styles.btnSwapIcon} onPress={() => setShowSwapModal(true)}>
                <Text style={styles.btnSwapIconText}>🔄 Tukar</Text>
              </TouchableOpacity>
            </View>

            {/* PILIHAN HARI */}
            <Text style={styles.sectionLabel}>Pilih Hari Tugas:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysContainer}>
              {DAYS.map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* DAFTAR PETUGAS RONDA HARI INI */}
            <View style={styles.scheduleHeaderRow}>
              <Text style={styles.scheduleTitle}>Petugas Ronda Hari {selectedDay}</Text>
              <Text style={styles.shiftBadge}>22:00 - 04:00 WIB</Text>
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#0B579D" />
                <Text style={styles.loadingText}>Memuat tim ronda...</Text>
              </View>
            ) : rondaSchedule && rondaSchedule.length > 0 ? (
              rondaSchedule.map((item, index) => (
                <View key={item.id || index} style={styles.officerCard}>
                  <Text style={styles.officerAvatar}>👨‍💼</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.officerName}>{item.officer_name || 'Petugas Ronda'}</Text>
                    <Text style={styles.officerBlock}>{item.block || 'Blok A'} • {item.role || 'Anggota Tim'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.btnCall3D}
                    onPress={() => Alert.alert('Kontak', `Menghubungkan ke ${item.officer_name}...`)}
                  >
                    <Text style={styles.btnCallText}>💬 WA</Text>
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>Jadwal Hari {selectedDay} Belum Diinput</Text>
                <Text style={styles.emptySub}>
                  Pengurus RT belum mengunggah daftar petugas ronda untuk hari ini.
                </Text>
              </View>
            )}

            {/* TOMBOL BAGIKAN JADWAL */}
            <TouchableOpacity style={styles.btnShareLarge} onPress={handleShareSchedule} activeOpacity={0.8}>
              <Text style={styles.btnShareText}>📲 BAGIKAN JADWAL KE GROUP WA</Text>
            </TouchableOpacity>

          </View>

          {/* WADAH RIWAYAT PENGAJUAN (IZIN / TUKAR JADWAL) KE PENGURUS */}
          {myRequests && myRequests.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>📋 Status Pengajuan ke Pengurus RT</Text>
              {myRequests.map((req) => (
                <View key={req.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyType}>
                      {req.request_type === 'IZIN' ? '📝 Pengajuan Izin' : '🔄 Tukar Jadwal'}
                    </Text>
                    <Text style={styles.historyDetail}>{req.detail_info}</Text>
                  </View>
                  <View style={[styles.statusBadge, req.status === 'APPROVED' ? styles.statusApproved : styles.statusPendingRt]}>
                    <Text style={[styles.statusBadgeText, req.status === 'APPROVED' ? styles.statusApprovedText : styles.statusPendingRtText]}>
                      {req.status === 'APPROVED' ? '✅ Disetujui RT' : '⏳ Pending RT'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* 🔴 MODAL 1: FORM AJUKAN IZIN KETIDAKHADIRAN */}
      <Modal visible={showPermissionModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Form Izin Tidak Ronda</Text>
            <Text style={styles.modalSub}>Pilih alasan dan kirim ke Pengurus RT:</Text>

            <View style={styles.permissionTypeRow}>
              {['Sakit', 'Dinas Luar', 'Lainnya'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBox, permissionType === type && styles.typeBoxActive]}
                  onPress={() => setPermissionType(type)}
                >
                  <Text style={[styles.typeText, permissionType === type && styles.typeTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Keterangan / Alasan Lengkap:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Contoh: Sedang demam / Ada tugas kantor luar kota"
              value={permissionNotes}
              onChangeText={setPermissionNotes}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnModalCancel} onPress={() => setShowPermissionModal(false)}>
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalSubmit} onPress={handleSubmitPermission}>
                <Text style={styles.btnModalSubmitText}>Kirim ke RT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔴 MODAL 2: FORM TUKAR JADWAL RONDA */}
      <Modal visible={showSwapModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tukar Jadwal Ronda</Text>
            <Text style={styles.modalSub}>Pilih hari tujuan & kirim permohonan ke Pengurus RT:</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              {DAYS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.typeBox, swapTargetDay === d && styles.typeBoxActive]}
                  onPress={() => setSwapTargetDay(d)}
                >
                  <Text style={[styles.typeText, swapTargetDay === d && styles.typeTextActive]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Alasan Tukar Jadwal:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Contoh: Bertukar dengan warga lain / Bentrok acara keluarga"
              value={swapReason}
              onChangeText={setSwapReason}
              multiline
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnModalCancel} onPress={() => setShowSwapModal(false)}>
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalSubmit} onPress={handleSubmitSwap}>
                <Text style={styles.btnModalSubmitText}>Kirim ke RT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  btnBack3D: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#0369A1',
    elevation: 4,
  },
  btnBackText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },

  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  centerWrapper: { width: '100%' },

  attendanceBoxCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  attendanceCardTitle: { fontSize: 16, fontWeight: 'bold', color: '#0B579D' },
  attendanceCardSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 14 },
  actionRowContainer: { flexDirection: 'row', justifyContent: 'space-between' },

  btnCheckIn3D: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#15803D',
    elevation: 3,
  },
  btnCheckInText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },

  btnPermission3D: {
    backgroundColor: '#EAB308',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#CA8A04',
    elevation: 3,
  },
  btnPermissionText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },

  permissionBadgeBox: {
    backgroundColor: '#FEF9C3',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  permissionBadgeTitle: { fontSize: 14, fontWeight: 'bold', color: '#854D0E' },
  permissionBadgeSub: { fontSize: 12, color: '#A16207', marginTop: 2 },

  checkedInResultBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  selfieRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  selfieImage: { width: 65, height: 65, borderRadius: 12, borderWidth: 2, borderColor: '#16A34A' },
  checkedInName: { fontSize: 15, fontWeight: 'bold', color: '#15803D' },
  checkedInDetail: { fontSize: 13, color: '#166534', marginTop: 2 },
  boldText: { fontWeight: 'bold' },

  btnCheckOut3D: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#991B1B',
    marginTop: 6,
  },
  btnCheckOutText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  completedBadge: { backgroundColor: '#BBF7D0', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 6 },
  completedText: { color: '#15803D', fontWeight: 'bold', fontSize: 12 },

  card: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22, elevation: 3 },
  cardTitleBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardIconHeader: { fontSize: 32, marginRight: 12 },
  cardHeaderTitle: { fontSize: 20, fontWeight: 'bold', color: '#0B579D' },
  cardHeaderSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  btnSwapIcon: { backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  btnSwapIconText: { fontSize: 11, fontWeight: 'bold', color: '#0284C7' },

  sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#0284C7', marginBottom: 10 },
  daysContainer: { flexDirection: 'row', paddingBottom: 16 },
  dayButton: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  dayButtonActive: { backgroundColor: '#0B579D', borderColor: '#0B579D' },
  dayText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  dayTextActive: { color: '#FFFFFF' },

  scheduleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  scheduleTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  shiftBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  officerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  officerAvatar: { fontSize: 28, marginRight: 12 },
  officerName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  officerBlock: { fontSize: 12, color: '#64748B', marginTop: 2 },
  btnCall3D: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#15803D',
  },
  btnCallText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },

  loadingBox: { paddingVertical: 24, alignItems: 'center' },
  loadingText: { fontSize: 13, color: '#64748B', marginTop: 8 },

  emptyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
  emptyTitle: { fontSize: 14, fontWeight: 'bold', color: '#475569' },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4 },

  btnShareLarge: {
    backgroundColor: '#0B579D',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
  },
  btnShareText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },

  /* Wadah Riwayat Pengajuan */
  historyContainer: { marginTop: 22 },
  historyTitle: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 12 },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
  },
  historyType: { fontSize: 14, fontWeight: 'bold', color: '#0F172A' },
  historyDetail: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusPendingRt: { backgroundColor: '#FEF3C7' },
  statusPendingRtText: { color: '#D97706', fontWeight: 'bold', fontSize: 11 },
  statusApproved: { backgroundColor: '#DCFCE7' },
  statusApprovedText: { color: '#15803D', fontWeight: 'bold', fontSize: 11 },

  /* Modal Styling */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', paddingHorizontal: 20 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0B579D' },
  modalSub: { fontSize: 12, color: '#64748B', marginTop: 2, marginBottom: 16 },
  permissionTypeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  typeBox: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  typeBoxActive: { backgroundColor: '#0B579D', borderColor: '#0B579D' },
  typeText: { fontSize: 11, fontWeight: 'bold', color: '#475569' },
  typeTextActive: { color: '#FFFFFF' },
  label: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnModalCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginRight: 10, backgroundColor: '#F1F5F9' },
  btnModalCancelText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  btnModalSubmit: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0B579D' },
  btnModalSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});