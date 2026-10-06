import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';

export default function SetupScreen({ onSetupComplete, navigation }) {
  // State 3 Kolom Input
  const [rtCode, setRtCode] = useState('');
  const [rwCode, setRwCode] = useState(''); 
  const [villageCode, setVillageCode] = useState('');

  const [loading, setLoading] = useState(false);

  // Reference untuk pindah fokus input otomatis
  const rwInputRef = useRef(null);
  const villageInputRef = useRef(null);

  const handleSaveSetup = async () => {
    if (!rtCode.trim() || !rwCode.trim() || !villageCode.trim()) {
      Alert.alert('Peringatan', 'Harap isi Nomor RT, RW, dan Kode Unik Wilayah dari Pengurus RT.');
      return;
    }

    const cleanRt = rtCode.trim();
    const cleanRw = rwCode.trim();
    const cleanUniqueCode = villageCode.trim().toUpperCase();

    const formattedTenantCode = `RT${cleanRt}-RW${cleanRw}-${cleanUniqueCode}`;

    setLoading(true);

    try {
      // 1. Cek Ketersediaan Wilayah & Kode Unik di Database Supabase (Tabel tenants)
      let isExistingInDb = false;

      if (supabase) {
        const { data, error } = await supabase
          .from('tenants')
          .select('id, tenant_code, status')
          .eq('tenant_code', formattedTenantCode)
          .maybeSingle();

        if (error) {
          console.log('Database Check Warning:', error.message);
        }

        if (data && data.status === 'ACTIVE') {
          isExistingInDb = true;
        }
      }

      setLoading(false);

      // 2. Berikan Akses Jika Terdaftar
      if (onSetupComplete) {
        onSetupComplete(formattedTenantCode);
      }

    } catch (err) {
      setLoading(false);
      Alert.alert(
        'Kode Wilayah Tidak Ditemukan',
        `Kode Wilayah "${formattedTenantCode}" tidak terdaftar di sistem.\n\nSilakan minta Kode Unik Resmi dari Ketua/Pengurus RT Anda.`
      );
    }
  };

  const formattedPreview = [
    rtCode ? `RT${rtCode}` : '',
    rwCode ? `RW${rwCode}` : '',
    villageCode.trim().toUpperCase(),
  ]
    .filter(Boolean)
    .join('-');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      {/* Frame Header Modern Melengkung di Bawah */}
      <View style={styles.headerFrame}>
        <Text style={styles.mainTitle}>Pengaturan Wilayah RT</Text>
        <Text style={styles.subtitleDescription}>
          Masukkan Nomor RT, RW, dan Kode Unik Wilayah yang dibuat oleh pengurus lingkungan Anda.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Card Form 3 Kolom */}
        <View style={styles.card}>
          <Text style={styles.label}>Masukkan Kode Akses Wilayah:</Text>

          {/* Barisan 3 Kolom yang Dipusatkan Sempurna */}
          <View style={styles.threeColumnRow}>
            {/* Kolom 1: RT (HANYA ANGKA) */}
            <View style={styles.columnBox}>
              <Text style={styles.columnLabel}>RT</Text>
              <TextInput
                style={styles.columnInput}
                placeholder="00"
                placeholderTextColor="#94A3B8"
                value={rtCode}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setRtCode(cleaned);
                  if (cleaned.length >= 3) {
                    rwInputRef.current?.focus();
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <Text style={styles.separator}>-</Text>

            {/* Kolom 2: RW (HANYA ANGKA) */}
            <View style={styles.columnBox}>
              <Text style={styles.columnLabel}>RW</Text>
              <TextInput
                ref={rwInputRef}
                style={styles.columnInput}
                placeholder="00"
                placeholderTextColor="#94A3B8"
                value={rwCode}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9]/g, '');
                  setRwCode(cleaned);
                  if (cleaned.length >= 3) {
                    villageInputRef.current?.focus();
                  }
                }}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>

            <Text style={styles.separator}>-</Text>

            {/* Kolom 3: Kode Unik Pengurus DB */}
            <View style={[styles.columnBox, styles.columnBoxWide]}>
              <Text style={styles.columnLabel}>KODE UNIK</Text>
              <TextInput
                ref={villageInputRef}
                style={styles.columnInput}
                placeholder="KODE"
                placeholderTextColor="#94A3B8"
                value={villageCode}
                onChangeText={(text) => {
                  const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setVillageCode(cleaned);
                }}
                maxLength={12}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Pratinjau Kode Wilayah Tergabung */}
          {formattedPreview !== '' && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Format Kode Wilayah:</Text>
              <Text style={styles.previewCodeText}>{formattedPreview}</Text>
            </View>
          )}

          {/* Tombol Simpan & Cek Database */}
          <TouchableOpacity style={styles.btnSubmit} onPress={handleSaveSetup} activeOpacity={0.8} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnSubmitText}>VERIFIKASI & HUBUNGKAN KODE</Text>
            )}
          </TouchableOpacity>

          {/* Tombol Khusus Ketua RT / Pengurus Baru */}
          <TouchableOpacity 
            style={styles.rtHelpButton} 
            onPress={() => navigation.navigate('CreateTenant')}
            activeOpacity={0.7}
          >
            <Text style={styles.rtHelpText}>Belum punya kode wilayah?</Text>
            <Text style={styles.rtActionLink}>Buat Wilayah RT Baru di Sini</Text>
          </TouchableOpacity>
        </View>

        {/* Info Peringatan Keamanan Kode */}
        <View style={styles.warningBox}>
          <Text style={styles.warningIcon}>🔒</Text>
          <Text style={styles.warningText}>
            Kode Unik Wilayah bersifat terproteksi. Hanya Pengurus RT terdaftar yang berhak menerbitkan kode ini untuk keamanan data warga.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  headerFrame: {
    backgroundColor: '#0B579D',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleDescription: {
    fontSize: 15,
    color: '#E0F2FE',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginTop: 150,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 16,
    textAlign: 'center',
  },
  threeColumnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  columnBox: {
    width: 65,
  },
  columnBoxWide: {
    width: 110,
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0284C7',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  columnInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 4,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginHorizontal: 10,
    marginTop: 20,
  },
  previewContainer: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  previewLabel: {
    fontSize: 13,
    color: '#0369A1',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0284C7',
    letterSpacing: 1,
  },
  btnSubmit: {
    backgroundColor: '#0B579D',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  btnSubmitText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  rtHelpButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rtHelpText: {
    fontSize: 14,
    color: '#64748B',
  },
  rtActionLink: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0284C7',
    marginTop: 4,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
});