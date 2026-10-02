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
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../config/supabase';

export default function ReportScreen({ user, tenantCode, navigation }) {
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);

  // Modal State Buat Aduan Baru
  const [showModal, setShowModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('Infrastruktur'); // Infrastruktur, Keamanan, Kebersihan, Lainnya
  const [reportTitle, setReportTitle] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  
  // State Bukti Lampiran (Foto/Video + Watermark Waktu & Lokasi)
  const [attachment, setAttachment] = useState(null); // { uri, type, timestamp, locationText }
  const [attaching, setAttaching] = useState(false);

  const CATEGORIES = ['Semua', 'Infrastruktur', 'Keamanan', 'Kebersihan', 'Lainnya'];
  const [selectedFilter, setSelectedFilter] = useState('Semua');
  const currentTenant = tenantCode || 'RT006-RW012-KEDIP';

  // Fetch Aduan Warga dari Supabase
  const fetchReports = async () => {
    setLoading(true);
    try {
      if (supabase && user?.id) {
        let query = supabase
          .from('citizen_reports')
          .select('*')
          .eq('tenant_code', currentTenant)
          .order('created_at', { ascending: false });

        if (selectedFilter !== 'Semua') {
          query = query.eq('category', selectedFilter);
        }

        const { data, error } = await query;
        if (!error && data) {
          setReports(data);
        }
      }
    } catch (err) {
      console.log('Error fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Subscription Aduan
  useEffect(() => {
    fetchReports();

    let channel = null;
    if (supabase) {
      channel = supabase
        .channel(`public:citizen_reports:${currentTenant}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'citizen_reports',
            filter: `tenant_code=eq.${currentTenant}`,
          },
          () => {
            fetchReports();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [selectedFilter, tenantCode]);

  // 🟢 FUNGSI GENERATE WATERMARK WAKTU & LOKASI OTOMATIS
  const generateWatermarkData = async () => {
    let locationString = 'Lokasi: RT 006 / RW 012';
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        locationString = `Lat: ${loc.coords.latitude.toFixed(4)}, Long: ${loc.coords.longitude.toFixed(4)}`;
      }
    } catch (e) {
      console.log('Gagal ambil lokasi watermark:', e);
    }

    const now = new Date();
    const timeString = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }) + ' • ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

    return {
      timestamp: timeString,
      locationText: locationString,
    };
  };

  // 🟢 AMBIL FOTO/VIDEO DARI KAMERA DENGAN WATERMARK
  const handleCaptureCamera = async () => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan akses kamera untuk melampirkan bukti.');
      return;
    }

    setAttaching(true);
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const wm = await generateWatermarkData();
        setAttachment({
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image',
          timestamp: wm.timestamp,
          locationText: wm.locationText,
        });
      }
    } catch (err) {
      console.log('Camera error:', err);
    } finally {
      setAttaching(false);
    }
  };

  // 🟢 PILIH FOTO/VIDEO DARI GALERI DENGAN WATERMARK OTOMATIS
  const handlePickGallery = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan akses galeri.');
      return;
    }

    setAttaching(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        const wm = await generateWatermarkData();
        setAttachment({
          uri: result.assets[0].uri,
          type: result.assets[0].type || 'image',
          timestamp: wm.timestamp,
          locationText: wm.locationText,
        });
      }
    } catch (err) {
      console.log('Gallery error:', err);
    } finally {
      setAttaching(false);
    }
  };

  // Kirim Aduan Baru
  const handleSubmitReport = async () => {
    if (!reportTitle.trim() || !reportDesc.trim()) {
      Alert.alert('Peringatan', 'Harap isi Judul Aduan dan Keterangan Masalah dengan lengkap.');
      return;
    }

    setLoading(true);
    try {
      if (supabase && user?.id) {
        await supabase.from('citizen_reports').insert([
          {
            tenant_code: currentTenant,
            user_id: user.id,
            reporter_name: user?.name || 'Warga',
            reporter_block: user?.block || 'Blok A',
            category: reportCategory,
            title: reportTitle.trim(),
            description: reportDesc.trim(),
            attachment_uri: attachment?.uri || null,
            watermark_time: attachment?.timestamp || null,
            watermark_loc: attachment?.locationText || null,
            status: 'PENDING',
            created_at: new Date().toISOString(),
          },
        ]);
      }

      setShowModal(false);
      setReportTitle('');
      setReportDesc('');
      setAttachment(null);
      fetchReports();

      Alert.alert('✅ Terkirim', 'Laporan aduan beserta watermark waktu & lokasi telah diteruskan ke Pengurus RT.');
    } catch (err) {
      console.log('Error submit report:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim aduan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FA" />

      {/* Header Bar Bersih (Tanpa Tombol Kembali) */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>📢 Aduan Warga RT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrapper}>

          {/* BANNER UTAMA */}
          <View style={styles.bannerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Layanan Aspirasi & Aduan</Text>
              <Text style={styles.bannerSub}>
                Laporkan kendala fasilitas umum atau keamanan lingkungan disertai bukti foto/video berwatermark.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnAddReport3D}
              onPress={() => setShowModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAddReportText}>+ Buat Aduan</Text>
            </TouchableOpacity>
          </View>

          {/* FILTER KATEGORI */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catButton, selectedFilter === cat && styles.catButtonActive]}
                onPress={() => setSelectedFilter(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, selectedFilter === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* DAFTAR ADUAN */}
          {loading && reports.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0B579D" />
              <Text style={styles.loadingText}>Memuat daftar aduan...</Text>
            </View>
          ) : reports && reports.length > 0 ? (
            <View style={styles.reportGrid}>
              {reports.map((item) => {
                const status = item.status || 'PENDING';
                return (
                  <View key={item.id} style={styles.reportCard}>
                    <View style={styles.reportHeaderRow}>
                      <Text style={styles.reportCategory}>📌 {item.category}</Text>
                      <View style={[
                        styles.statusBadge, 
                        status === 'COMPLETED' ? styles.badgeSuccess : status === 'PROCESS' ? styles.badgeProcess : styles.badgePending
                      ]}>
                        <Text style={[
                          styles.statusText, 
                          status === 'COMPLETED' ? styles.textSuccess : status === 'PROCESS' ? styles.textProcess : styles.textPending
                        ]}>
                          {status === 'COMPLETED' ? '✅ Selesai' : status === 'PROCESS' ? '⚙️ Diproses' : '⏳ Menunggu'}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.reportTitle}>{item.title}</Text>
                    <Text style={styles.reportDesc}>{item.description}</Text>

                    {/* PREVIEW LAMPIRAN DENGAN WATERMARK */}
                    {item.attachment_uri && (
                      <View style={styles.attachmentContainer}>
                        <Image source={{ uri: item.attachment_uri }} style={styles.previewImage} />
                        <View style={styles.watermarkOverlay}>
                          <Text style={styles.watermarkText}>{item.watermark_time || 'Waktu tercatat'}</Text>
                          <Text style={styles.watermarkText}>{item.watermark_loc || 'Lokasi terverifikasi'}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.reportFooter}>
                      <Text style={styles.reportAuthor}>👤 {item.reporter_name} ({item.reporter_block})</Text>
                      <Text style={styles.reportDate}>{new Date(item.created_at).toLocaleDateString('id-ID')}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>Belum Ada Aduan</Text>
              <Text style={styles.emptySub}>
                Lingkungan aman dan tertib. Belum ada aduan yang tercatat di kategori ini.
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* 🔴 MODAL BUAT ADUAN BARU */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Buat Aduan Masalah</Text>
            <Text style={styles.modalSub}>Sampaikan laporan atau keluhan Anda ke Pengurus RT:</Text>

            <Text style={styles.label}>Kategori Masalah:</Text>
            <View style={styles.permissionTypeRow}>
              {['Infrastruktur', 'Keamanan', 'Kebersihan', 'Lainnya'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.typeBox, reportCategory === cat && styles.typeBoxActive]}
                  onPress={() => setReportCategory(cat)}
                >
                  <Text style={[styles.typeText, reportCategory === cat && styles.typeTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Judul Aduan: *</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Contoh: Lampu jalan mati di Blok B"
              value={reportTitle}
              onChangeText={setReportTitle}
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Keterangan / Detail Masalah: *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Jelaskan detail lokasi dan kendala selengkapnya."
              value={reportDesc}
              onChangeText={setReportDesc}
              multiline
              placeholderTextColor="#94A3B8"
            />

            {/* TOMBOL LAMPIRKAN FOTO / VIDEO DENGAN WATERMARK */}
            <Text style={styles.label}>Bukti Foto / Video (Berwatermark Waktu & Lokasi):</Text>
            <View style={styles.attachBtnRow}>
              <TouchableOpacity style={styles.btnAttach} onPress={handleCaptureCamera} disabled={attaching}>
                <Text style={styles.btnAttachText}>📸 Ambil Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnAttachGallery} onPress={handlePickGallery} disabled={attaching}>
                <Text style={styles.btnAttachText}>🖼 Pilih Galeri</Text>
              </TouchableOpacity>
            </View>

            {attaching && <ActivityIndicator size="small" color="#0B579D" style={{ marginVertical: 8 }} />}

            {/* PREVIEW LAMPIRAN DENGAN WATERMARK DI FORM */}
            {attachment && (
              <View style={styles.attachmentContainerModal}>
                <Image source={{ uri: attachment.uri }} style={styles.previewImageModal} />
                <View style={styles.watermarkOverlay}>
                  <Text style={styles.watermarkText}>{attachment.timestamp}</Text>
                  <Text style={styles.watermarkText}>{attachment.locationText}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnModalCancel} onPress={() => setShowModal(false)}>
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalSubmit} onPress={handleSubmitReport} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.btnModalSubmitText}>Kirim Aduan</Text>}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },

  scrollContent: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 50 },
  centerWrapper: { width: '100%' },

  bannerCard: {
    backgroundColor: '#0B579D',
    borderRadius: 22,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    elevation: 3,
  },
  bannerTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: '#BAE6FD', marginTop: 3, lineHeight: 17 },
  btnAddReport3D: {
    backgroundColor: '#E11D48',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#BE123C',
    marginLeft: 10,
  },
  btnAddReportText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  categoriesContainer: { flexDirection: 'row', paddingBottom: 16 },
  catButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    elevation: 1,
  },
  catButtonActive: { backgroundColor: '#0B579D', borderColor: '#0B579D' },
  catText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  catTextActive: { color: '#FFFFFF' },

  reportGrid: { width: '100%' },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reportHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reportCategory: { fontSize: 12, fontWeight: 'bold', color: '#0284C7' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeProcess: { backgroundColor: '#E0F2FE' },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  textPending: { color: '#D97706' },
  textProcess: { color: '#0284C7' },
  textSuccess: { color: '#15803D' },

  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  reportDesc: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 12 },

  /* Watermark Container */
  attachmentContainer: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#000000',
    position: 'relative',
  },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  watermarkText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },

  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  reportAuthor: { fontSize: 11, color: '#64748B' },
  reportDate: { fontSize: 11, color: '#94A3B8' },

  loadingBox: { paddingVertical: 30, alignItems: 'center' },
  loadingText: { fontSize: 13, color: '#64748B', marginTop: 8 },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTitle: { fontSize: 15, fontWeight: 'bold', color: '#475569' },
  emptySub: { fontSize: 12, color: '#94A3B8', textAlign: 'center', marginTop: 4, lineHeight: 17 },

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
  inputLarge: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
  },
  attachBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  btnAttach: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  btnAttachGallery: {
    flex: 1,
    backgroundColor: '#475569',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  btnAttachText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  attachmentContainerModal: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#000000',
    position: 'relative',
  },
  previewImageModal: { width: '100%', height: '100%', resizeMode: 'cover' },

  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnModalCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginRight: 10, backgroundColor: '#F1F5F9' },
  btnModalCancelText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  btnModalSubmit: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0B579D' },
  btnModalSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});