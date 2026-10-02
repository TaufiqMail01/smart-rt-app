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
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

export default function AssetRtScreen({ user, tenantCode, navigation }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState([]);
  
  // Modal Peminjaman Asset
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowDate, setBorrowDate] = useState('');
  const [borrowDuration, setBorrowDuration] = useState('1 Hari');
  const [borrowNotes, setBorrowNotes] = useState('');

  const currentTenant = tenantCode || 'RT006-RW012-KEDIP';

  // Fetch Data Asset RT dari Supabase
  const fetchAssets = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('rt_assets')
          .select('*')
          .eq('tenant_code', currentTenant)
          .order('asset_name', { ascending: true });

        if (!error && data) {
          setAssets(data);
        }
      }
    } catch (err) {
      console.log('Error fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time Subscription untuk Asset RT
  useEffect(() => {
    fetchAssets();

    let channel = null;
    if (supabase) {
      channel = supabase
        .channel(`public:rt_assets:${currentTenant}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'rt_assets',
            filter: `tenant_code=eq.${currentTenant}`,
          },
          () => {
            fetchAssets();
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [tenantCode]);

  // Ajukan Peminjaman Asset
  const handleBorrowSubmit = async () => {
    if (!selectedAsset) return;

    try {
      if (supabase && user?.id) {
        // 1. Catat ke tabel peminjaman
        await supabase.from('asset_borrow_requests').insert([
          {
            tenant_code: currentTenant,
            asset_id: selectedAsset.id,
            asset_name: selectedAsset.asset_name,
            user_id: user.id,
            borrower_name: user?.name || 'Warga',
            borrower_block: user?.block || 'Blok A',
            duration: borrowDuration,
            notes: borrowNotes.trim() || 'Keperluan warga',
            status: 'PENDING_APPROVAL',
            created_at: new Date().toISOString(),
          },
        ]);

        // 2. Update status asset menjadi 'Dipinjam / Pending'
        await supabase
          .from('rt_assets')
          .update({ status: 'PENDING' })
          .eq('id', selectedAsset.id);
      }

      setShowBorrowModal(false);
      setBorrowNotes('');
      fetchAssets();

      Alert.alert(
        '📩 Permohonan Terkirim',
        `Permohonan peminjaman "${selectedAsset.asset_name}" telah dikirim ke Pengurus RT / Petugas Inventaris untuk diverifikasi.`
      );
    } catch (err) {
      console.log('Error borrowing asset:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengajukan peminjaman.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FA" />

      {/* Header Bar 3D */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.btnBack3D}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.btnBackText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Asset & Inventaris RT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrapper}>

          {/* BANNER INFORMASI */}
          <View style={styles.bannerCard}>
            <Text style={styles.bannerTitle}>⛺ Peminjaman Barang RT</Text>
            <Text style={styles.bannerSub}>
              Fasilitas bersama warga (Tenda, Kursi, Sound System, dll). Cek ketersediaan dan pinjam secara transparan.
            </Text>
          </View>

          {/* DAFTAR ASSET */}
          {loading && assets.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0B579D" />
              <Text style={styles.loadingText}>Memuat data asset RT...</Text>
            </View>
          ) : assets && assets.length > 0 ? (
            <View style={styles.assetGrid}>
              {assets.map((item) => {
                const isAvailable = item.status === 'AVAILABLE' || !item.status;
                return (
                  <View key={item.id} style={styles.assetCard}>
                    <View style={styles.assetIconBox}>
                      <Text style={styles.assetEmoji}>⛺</Text>
                    </View>

                    <View style={{ flex: 1, paddingVertical: 2, marginRight: 10 }}>
                      <Text style={styles.assetName}>{item.asset_name}</Text>
                      <Text style={styles.assetStock}>Stok: {item.stock || 1} Unit</Text>
                      <Text style={styles.assetDesc} numberOfLines={2}>{item.description || 'Inventaris resmi milik warga RT.'}</Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={[styles.statusBadge, isAvailable ? styles.badgeAvailable : styles.badgeBusy]}>
                        <Text style={[styles.statusText, isAvailable ? styles.textAvailable : styles.textBusy]}>
                          {isAvailable ? '✅ Tersedia' : '⏳ Dipinjam'}
                        </Text>
                      </View>

                      {isAvailable && (
                        <TouchableOpacity
                          style={styles.btnBorrow3D}
                          onPress={() => {
                            setSelectedAsset(item);
                            setShowBorrowModal(true);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.btnBorrowText}>Pinjam</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>Belum Ada Asset RT Terdaftar</Text>
              <Text style={styles.emptySub}>
                Pengurus RT belum menambahkan daftar inventaris barang di sistem.
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* 🔴 MODAL FORM PEMINJAMAN ASSET */}
      <Modal visible={showBorrowModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Form Peminjaman Asset</Text>
            <Text style={styles.modalSub}>
              Barang yang akan dipinjam: <Text style={{ fontWeight: 'bold', color: '#0B579D' }}>{selectedAsset?.asset_name}</Text>
            </Text>

            <Text style={styles.label}>Durasi Peminjaman:</Text>
            <View style={styles.durationRow}>
              {['1 Hari', '2 Hari', '3 Hari', '1 Minggu'].map((dur) => (
                <TouchableOpacity
                  key={dur}
                  style={[styles.typeBox, borrowDuration === dur && styles.typeBoxActive]}
                  onPress={() => setBorrowDuration(dur)}
                >
                  <Text style={[styles.typeText, borrowDuration === dur && styles.typeTextActive]}>{dur}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Keperluan Penggunaan: *</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Contoh: Acara syukuran keluarga / Kerja bakti warga"
              value={borrowNotes}
              onChangeText={setBorrowNotes}
              multiline
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnModalCancel} onPress={() => setShowBorrowModal(false)}>
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalSubmit} onPress={handleBorrowSubmit}>
                <Text style={styles.btnModalSubmitText}>Ajukan Peminjaman</Text>
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

  bannerCard: {
    backgroundColor: '#0B579D',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    elevation: 3,
  },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: '#BAE6FD', marginTop: 3, lineHeight: 17 },

  assetGrid: { width: '100%' },
  assetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  assetIconBox: {
    width: 55,
    height: 55,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  assetEmoji: { fontSize: 26 },
  assetName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  assetStock: { fontSize: 12, fontWeight: 'bold', color: '#0284C7', marginTop: 2 },
  assetDesc: { fontSize: 11, color: '#94A3B8', marginTop: 3 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  badgeAvailable: { backgroundColor: '#DCFCE7' },
  badgeBusy: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  textAvailable: { color: '#15803D' },
  textBusy: { color: '#B45309' },

  btnBorrow3D: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#15803D',
  },
  btnBorrowText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },

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
  durationRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
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