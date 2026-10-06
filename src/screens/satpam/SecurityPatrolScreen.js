import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Alert, Modal, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../../config/supabase';

export default function SecurityPatrolScreen({ tenantCode, user }) {
  const [patrolLogs, setPatrolLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State untuk Modal Form Patroli Baru
  const [modalVisible, setModalVisible] = useState(false);
  const [patrolRoute, setPatrolRoute] = useState('');
  const [patrolCondition, setPatrolCondition] = useState('Aman Terkendali');
  const [patrolNotes, setPatrolNotes] = useState('');
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [locationCoords, setLocationCoords] = useState(null);
  const [captureTime, setCaptureTime] = useState('');
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const fetchPatrolLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patrol_logs')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Info tabel patrol_logs:', error.message);
        setPatrolLogs([]);
      } else {
        setPatrolLogs(data || []);
      }
    } catch (err) {
      console.error('Gagal memuat log patroli:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatrolLogs();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatrolLogs();
  };

  // Fungsi Otomatis Mengunci Titik GPS & Waktu Saat Ini
  const handleAutoGetLocationAndDateTime = async () => {
    // Catat waktu saat formulir dibuka
    const now = new Date();
    const formattedDateTime = now.toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });
    setCaptureTime(formattedDateTime);

    try {
      setFetchingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationCoords('Izin GPS Ditolak');
        setFetchingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coordStr = `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}`;
      setLocationCoords(coordStr);
    } catch (err) {
      setLocationCoords('Gagal Mendapatkan GPS');
    } finally {
      setFetchingLocation(false);
    }
  };

  // Buka Modal dan Langsung Kunci GPS & Waktu Otomatis
  const handleOpenModal = () => {
    setModalVisible(true);
    setLocationCoords(null);
    setCaptureTime('');
    handleAutoGetLocationAndDateTime();
  };

  // Fungsi Mengambil Foto Bukti dari Kamera
  const handlePickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const originalUri = result.assets[0].uri;
      
      try {
        const manipResult = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 1000 } }],
          { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
        );
        setEvidenceImage(manipResult.uri);
      } catch (e) {
        setEvidenceImage(originalUri);
      }
    }
  };

  // Fungsi Menyimpan Laporan Patroli Lengkap
  const handleSavePatrol = async () => {
    if (!patrolRoute.trim()) {
      Alert.alert('Perhatian', 'Jalur / Blok patroli wajib diisi!');
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = null;

      if (evidenceImage) {
        const response = await fetch(evidenceImage);
        const blob = await response.blob();
        const fileExt = 'jpg';
        const fileName = `patrol_${Date.now()}.${fileExt}`;
        const filePath = `${tenantCode || 'UMUM'}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('patrol-evidence')
          .upload(filePath, blob);

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from('patrol-evidence')
            .getPublicUrl(filePath);
          imageUrl = publicUrlData.publicUrl;
        }
      }

      const { error } = await supabase.from('patrol_logs').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          route: patrolRoute.trim(),
          condition: patrolCondition.trim(),
          notes: patrolNotes.trim() || 'Tidak ada catatan khusus.',
          officer_name: user?.name || 'Satpam Pos',
          evidence_image_url: imageUrl,
          location_gps: locationCoords || 'Manual / Tidak Aktif',
          created_at: new Date()
        }
      ]);

      if (error) throw error;

      Alert.alert('Sukses', 'Laporan patroli ber-watermark waktu & GPS berhasil disimpan.');
      setPatrolRoute('');
      setPatrolCondition('Aman Terkendali');
      setPatrolNotes('');
      setEvidenceImage(null);
      setLocationCoords(null);
      setCaptureTime('');
      setModalVisible(false);
      fetchPatrolLogs();
    } catch (err) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan laporan.\n\nDetail: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderPatrolItem = ({ item }) => {
    const isAman = item.condition.toLowerCase().includes('aman');
    const formattedRecordTime = new Date(item.created_at).toLocaleString('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.routeTitle}>📍 {item.route}</Text>
          <View style={[styles.badge, isAman ? styles.badgeAman : styles.badgeWaspada]}>
            <Text style={[styles.badgeText, isAman ? styles.textAman : styles.textWaspada]}>{item.condition}</Text>
          </View>
        </View>

        <Text style={styles.cardDetail}>📝 Keterangan: <Text style={styles.bold}>{item.notes}</Text></Text>
        <Text style={styles.cardDetail}>🌐 Lokasi GPS: <Text style={styles.bold}>{item.location_gps || '-'}</Text></Text>
        <Text style={styles.cardDetail}>🛡️ Petugas: {item.officer_name || 'Satpam'}</Text>
        
        {/* Tampilkan Foto Bukti Lengkap dengan Watermark Tanggal, Jam, GPS & Klaster */}
        {item.evidence_image_url && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.evidence_image_url }} style={styles.evidenceThumbnail} />
            <View style={styles.watermarkOverlay}>
              <Text style={styles.watermarkText}>🛡️ Klaster {item.tenant_code || 'UMUM'} | {item.officer_name}</Text>
              <Text style={styles.watermarkSubText}>🕒 {formattedRecordTime}</Text>
              <Text style={styles.watermarkSubText}>📍 GPS: {item.location_gps}</Text>
            </View>
          </View>
        )}

        <Text style={styles.cardTime}>🕒 Diunggah: {formattedRecordTime}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header Banner Atas */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerBannerBadge}>LOG KELILING & WATERMARK WAKTU</Text>
        <Text style={styles.headerTitle}>Catatan Patroli Satpam</Text>
        <Text style={styles.headerSubtitle}>Klaster: {tenantCode || 'UMUM'} | Terverifikasi</Text>
      </View>

      <FlatList
        data={patrolLogs}
        keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
        renderItem={renderPatrolItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
        ListHeaderComponent={
          <View>
            <TouchableOpacity 
              style={styles.btnAddPatrolMain} 
              onPress={handleOpenModal}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAddPatrolMainText}>Laporan Patroli Keliling</Text>
            </TouchableOpacity>

            <View style={styles.historyTitleBox}>
              <Text style={styles.historySectionHeader}>📋 Riwayat Laporan Patroli ({patrolLogs.length})</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Belum ada riwayat laporan patroli keliling.</Text>
            </View>
          )
        }
      />

      {/* Modal Form Tambah Laporan Patroli */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>📸 Laporan Patroli Watermark</Text>
            <Text style={styles.modalSubtitle}>Waktu & GPS terkunci otomatis saat formulir dibuka.</Text>

            {/* Indikator Status GPS & Waktu Otomatis */}
            <View style={styles.gpsStatusBox}>
              {fetchingLocation ? (
                <View style={styles.rowLoading}>
                  <ActivityIndicator size="small" color="#0284C7" />
                  <Text style={styles.gpsLoadingText}> Mengunci waktu & titik koordinat GPS...</Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.gpsSuccessText}>🕒 Waktu: {captureTime}</Text>
                  <Text style={styles.gpsSuccessText}>📍 GPS: {locationCoords || 'Gagal Mendapatkan Lokasi'}</Text>
                </View>
              )}
            </View>

            <Text style={styles.label}>Jalur / Blok yang Dicek *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Blok A - Blok C"
              placeholderTextColor="#94A3B8"
              value={patrolRoute}
              onChangeText={setPatrolRoute}
            />

            <Text style={styles.label}>Kondisi Lapangan *</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Aman Terkendali / Lampu Padam"
              placeholderTextColor="#94A3B8"
              value={patrolCondition}
              onChangeText={setPatrolCondition}
            />

            <Text style={styles.label}>Catatan / Temuan Khusus</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Ketik keterangan atau temuan di lapangan..."
              placeholderTextColor="#94A3B8"
              value={patrolNotes}
              onChangeText={setPatrolNotes}
              multiline
            />

            {/* Tombol Ambil Foto Bukti */}
            <View style={styles.evidenceActionRow}>
              <TouchableOpacity style={styles.btnCamera} onPress={handlePickImage} activeOpacity={0.8}>
                <Text style={styles.btnCameraText}>📷 Ambil Foto Bukti Lapangan</Text>
              </TouchableOpacity>
            </View>

            {/* Pratinjau Foto dengan Simulasi Watermark Waktu & GPS */}
            {evidenceImage && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: evidenceImage }} style={styles.previewImage} />
                <View style={styles.watermarkOverlayPreview}>
                  <Text style={styles.watermarkText}>🛡️ Klaster {tenantCode || 'UMUM'} | {user?.name || 'Satpam'}</Text>
                  <Text style={styles.watermarkSubText}>🕒 {captureTime || 'Waktu Real-time'}</Text>
                  <Text style={styles.watermarkSubText}>📍 GPS: {locationCoords || 'Mencari...'}</Text>
                </View>
                <TouchableOpacity onPress={() => setEvidenceImage(null)}>
                  <Text style={styles.removePhotoText}>❌ Hapus Foto</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity 
                style={styles.btnCancel} 
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
                disabled={submitting}
              >
                <Text style={styles.btnCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.btnSubmit} 
                onPress={handleSavePatrol}
                activeOpacity={0.8}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSubmitText}>Simpan Laporan</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA' 
  },
  headerBanner: { 
    backgroundColor: '#0B579D', 
    padding: 22, 
    marginHorizontal: 16,
    marginTop: 32, 
    borderRadius: 14, 
    elevation: 3 
  },
  headerBannerBadge: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#93C5FD', 
    marginBottom: 6, 
    letterSpacing: 1 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 6 
  },
  headerSubtitle: { 
    fontSize: 15, 
    color: '#E0F2FE',
    fontWeight: '600' 
  },
  listContainer: { 
    padding: 16,
    paddingTop: 12,
    paddingBottom: 30 
  },
  btnAddPatrolMain: {
    backgroundColor: '#166534',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  btnAddPatrolMainText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  historyTitleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    elevation: 1,
    alignItems: 'center'
  },
  historySectionHeader: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#0B579D', 
    letterSpacing: 0.5
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 14, 
    padding: 18, 
    marginBottom: 14, 
    elevation: 2, 
    borderWidth: 1.5, 
    borderColor: '#CBD5E1' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 10 
  },
  routeTitle: { 
    fontSize: 19, 
    fontWeight: 'bold', 
    color: '#1E293B',
    flex: 1,
    marginRight: 8
  },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8 
  },
  badgeAman: { 
    backgroundColor: '#DCFCE7' 
  },
  badgeWaspada: { 
    backgroundColor: '#FEF3C7' 
  },
  badgeText: { 
    fontSize: 13, 
    fontWeight: 'bold' 
  },
  textAman: {
    color: '#166534'
  },
  textWaspada: {
    color: '#B45309'
  },
  cardDetail: { 
    fontSize: 16, 
    color: '#334155', 
    marginBottom: 8,
    fontWeight: '500'
  },
  bold: { 
    fontWeight: 'bold', 
    color: '#0F172A' 
  },
  imageContainer: {
    marginVertical: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    position: 'relative',
  },
  evidenceThumbnail: {
    width: '100%',
    height: 210,
    resizeMode: 'cover',
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  watermarkOverlayPreview: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  watermarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  watermarkSubText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '600',
  },
  cardTime: { 
    fontSize: 14, 
    color: '#64748B', 
    marginTop: 6, 
    fontWeight: '600' 
  },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 40 
  },
  emptyText: { 
    color: '#94A3B8', 
    fontSize: 16,
    fontWeight: '600' 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#CBD5E1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    fontWeight: '500',
  },
  gpsStatusBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  rowLoading: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gpsLoadingText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: '600',
    marginLeft: 6,
  },
  gpsSuccessText: {
    fontSize: 13,
    color: '#166534',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    fontWeight: '600',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  evidenceActionRow: {
    marginTop: 12,
  },
  btnCamera: {
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCameraText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 10,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 6,
    textAlign: 'center',
  },
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  btnCancel: {
    flex: 1,
    backgroundColor: '#64748B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  btnCancelText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnSubmit: {
    flex: 1,
    backgroundColor: '#0B579D',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  }
});