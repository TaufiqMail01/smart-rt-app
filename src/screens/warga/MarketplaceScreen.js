import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MarketplaceScreen() {
  const products = [
    { id: '1', name: 'Kue Basah Tradisional Bu Siti', price: 'Rp 15.000', owner: 'Blok A No. 3' },
    { id: '2', name: 'Air Galon & Gas Elpiji Pak Slamet', price: 'Rp 20.000', owner: 'Blok B No. 10' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      <View style={styles.headerFrame}>
        <Text style={styles.headerTitle}>Pasar Warga & UMKM</Text>
        <Text style={styles.headerSubtitle}>Dukung Produk & Usaha Tetangga Sekitar</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Etalase Produk Warga</Text>

        {products.map((item) => (
          <View key={item.id} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price}</Text>
              <Text style={styles.productOwner}>Pemilik: {item.owner}</Text>
            </View>
            <TouchableOpacity style={styles.btnContact} activeOpacity={0.8}>
              <Text style={styles.btnContactText}>Pesan</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  headerFrame: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#BAE6FD', marginTop: 2, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669', marginBottom: 4 },
  productOwner: { fontSize: 12, color: '#64748B' },
  btnContact: {
    backgroundColor: '#0B579D',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnContactText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
});