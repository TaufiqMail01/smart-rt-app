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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

export default function MarketplaceScreen({ user, tenantCode, navigation }) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Modal State Tambah Produk Warga
  const [showAddModal, setShowAddModal] = useState(false);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState('Makanan'); // Makanan, Jasa, Sembako
  const [productDesc, setProductDesc] = useState('');
  const [sellerPhone, setSellerPhone] = useState(user?.phone || '');

  const CATEGORIES = ['Semua', 'Makanan', 'Jasa', 'Sembako'];
  const currentTenant = tenantCode || 'RT006-RW012-KEDIP';

  // Fetch Data Produk dari Supabase
  const fetchProducts = async () => {
    setLoading(true);
    try {
      if (supabase) {
        let query = supabase
          .from('warga_marketplaces')
          .select('*')
          .eq('tenant_code', currentTenant)
          .order('created_at', { ascending: false });

        if (selectedCategory !== 'Semua') {
          query = query.eq('category', selectedCategory);
        }

        const { data, error } = await query;
        if (!error && data) {
          setProducts(data);
        }
      }
    } catch (err) {
      console.log('Error fetch marketplace:', err);
    } finally {
      setLoading(false);
    }
  };

  // 🔴 REAL-TIME SUBSCRIPTION SUPABASE (Sinkron ke Semua Warga RT)
  useEffect(() => {
    fetchProducts();

    let channel = null;
    if (supabase) {
      channel = supabase
        .channel(`public:warga_marketplaces:${currentTenant}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Mendengar semua aksi (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'warga_marketplaces',
            filter: `tenant_code=eq.${currentTenant}`,
          },
          (payload) => {
            console.log('Perubahan Lapak Warga terdeteksi secara real-time:', payload);
            fetchProducts(); // Refresh otomatis data saat ada warga nambah warung
          }
        )
        .subscribe();
    }

    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedCategory, tenantCode]);

  // Tambah Produk Baru oleh Warga
  const handleAddProduct = async () => {
    if (!productName.trim() || !productPrice.trim()) {
      Alert.alert('Peringatan', 'Harap isi Nama Produk dan Harga dengan benar.');
      return;
    }

    try {
      if (supabase && user?.id) {
        const { error } = await supabase.from('warga_marketplaces').insert([
          {
            tenant_code: currentTenant,
            user_id: user.id,
            seller_name: user?.name || 'Warga',
            seller_block: user?.block || 'Blok A',
            product_name: productName.trim(),
            price: productPrice.trim(),
            category: productCategory,
            description: productDesc.trim() || '-',
            whatsapp_number: sellerPhone.trim() || '08123456789',
            is_active: true,
          },
        ]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setProductName('');
      setProductPrice('');
      setProductDesc('');

      Alert.alert('Sukses', 'Warung / Produk Anda berhasil dipublikasikan dan langsung muncul di aplikasi warga RT!');
    } catch (err) {
      console.log('Error add product:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menambahkan produk.');
    }
  };

  // Hubungi Penjual via WhatsApp
  const handleContactSeller = (phone, productName) => {
    const formattedPhone = phone.startsWith('0') ? `+62${phone.slice(1)}` : phone;
    const message = `Halo, saya tertarik dengan produk *${productName}* yang dijual di Lapak Warga RT. Apakah masih tersedia?`;
    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch(() => {
      Alert.alert('Kesalahan', 'Tidak dapat membuka aplikasi WhatsApp.');
    });
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
        <Text style={styles.topBarTitle}>Lapak Warga RT</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.centerWrapper}>

          {/* BANNER UTAMA LAPAK */}
          <View style={styles.bannerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>🛍️ Pasar & Jasa Warga</Text>
              <Text style={styles.bannerSub}>
                Dukung UMKM tetangga sendiri! Data warung tersinkronisasi otomatis untuk seluruh warga RT.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.btnAddProduct3D}
              onPress={() => setShowAddModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.btnAddProductText}>+ Jual Produk</Text>
            </TouchableOpacity>
          </View>

          {/* KATEGORI PRODUK (FILTER) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catButton, selectedCategory === cat && styles.catButtonActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.7}
              >
                <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* DAFTAR PRODUK / JASA WARGA */}
          {loading && products.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#0B579D" />
              <Text style={styles.loadingText}>Memuat produk warga...</Text>
            </View>
          ) : products && products.length > 0 ? (
            <View style={styles.productGrid}>
              {products.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <View style={styles.productIconBox}>
                    <Text style={styles.productEmoji}>
                      {item.category === 'Makanan' ? '🍜' : item.category === 'Jasa' ? '🛠️' : '📦'}
                    </Text>
                  </View>

                  <View style={{ flex: 1, paddingVertical: 4 }}>
                    <Text style={styles.productName}>{item.product_name}</Text>
                    <Text style={styles.productPrice}>{item.price}</Text>
                    <Text style={styles.productSeller}>👤 {item.seller_name} ({item.seller_block})</Text>
                    <Text style={styles.productDesc} numberOfLines={2}>{item.description}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.btnWaBuy3D}
                    onPress={() => handleContactSeller(item.whatsapp_number, item.product_name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.btnWaBuyText}>💬 Pesan WA</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyTitle}>Belum Ada Produk di Kategori Ini</Text>
              <Text style={styles.emptySub}>
                Jadilah yang pertama mendaftarkan produk atau jasa usaha Anda!
              </Text>
            </View>
          )}

        </View>
      </ScrollView>

      {/* 🔴 MODAL TAMBAH PRODUK WARGA */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Tambah Produk / Jasa</Text>
            <Text style={styles.modalSub}>Promosikan usaha Anda ke seluruh warga RT:</Text>

            <Text style={styles.label}>Kategori Usaha:</Text>
            <View style={styles.permissionTypeRow}>
              {['Makanan', 'Jasa', 'Sembako'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.typeBox, productCategory === cat && styles.typeBoxActive]}
                  onPress={() => setProductCategory(cat)}
                >
                  <Text style={[styles.typeText, productCategory === cat && styles.typeTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Nama Produk / Jasa: *</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Contoh: Nasi Liwet / Jasa Cuci AC"
              value={productName}
              onChangeText={setProductName}
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Harga (Rp): *</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Contoh: Rp 15.000 / porsi"
              value={productPrice}
              onChangeText={setProductPrice}
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Nomor WhatsApp Penjual:</Text>
            <TextInput
              style={styles.inputLarge}
              placeholder="Contoh: 08123456789"
              value={sellerPhone}
              onChangeText={setSellerPhone}
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.label}>Keterangan / Deskripsi:</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Tuliskan detail produk, jam buka, atau ketentuan pesan."
              value={productDesc}
              onChangeText={setProductDesc}
              multiline
              placeholderTextColor="#94A3B8"
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.btnModalCancel} onPress={() => setShowAddModal(false)}>
                <Text style={styles.btnModalCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnModalSubmit} onPress={handleAddProduct}>
                <Text style={styles.btnModalSubmitText}>Publikasikan</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    elevation: 3,
  },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  bannerSub: { fontSize: 12, color: '#BAE6FD', marginTop: 3, lineHeight: 17 },
  btnAddProduct3D: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#15803D',
    marginLeft: 10,
  },
  btnAddProductText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },

  categoriesContainer: { flexDirection: 'row', paddingBottom: 16 },
  catButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    elevation: 1,
  },
  catButtonActive: { backgroundColor: '#0B579D', borderColor: '#0B579D' },
  catText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  catTextActive: { color: '#FFFFFF' },

  productGrid: { width: '100%' },
  productCard: {
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
  productIconBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  productEmoji: { fontSize: 28 },
  productName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#16A34A', marginTop: 2 },
  productSeller: { fontSize: 11, color: '#64748B', marginTop: 2 },
  productDesc: { fontSize: 11, color: '#94A3B8', marginTop: 4 },

  btnWaBuy3D: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#15803D',
    marginLeft: 8,
    alignItems: 'center',
  },
  btnWaBuyText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 11 },

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
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
  },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  btnModalCancel: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, marginRight: 10, backgroundColor: '#F1F5F9' },
  btnModalCancelText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  btnModalSubmit: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, backgroundColor: '#0B579D' },
  btnModalSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});