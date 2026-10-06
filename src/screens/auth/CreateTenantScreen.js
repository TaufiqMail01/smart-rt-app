import React, { useState } from 'react';
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

export default function CreateTenantScreen({ navigation }) {
  const [rtNumber, setRtNumber] = useState('');
  const [rwNumber, setRwNumber] = useState('');
  const [villageName, setVillageName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateTenant = async () => {
    if (!rtNumber.trim() || !rwNumber.trim() || !villageName.trim() || !adminName.trim() || !adminPhone.trim() || !adminPassword.trim()) {
      Alert.alert('Peringatan', 'Harap isi seluruh data wilayah dan akun Ketua RT dengan lengkap.');
      return;
    }

    const cleanRt = rtNumber.trim();
    const cleanRw = rwNumber.trim();
    const cleanVillage = villageName.trim().toUpperCase().replace(/[^A-Z]/g, '');

    // Menghasilkan format kode unik wilayah secara otomatis (Contoh: RT006-RW012-KEDIP)
    const generatedTenantCode = `RT${cleanRt}-RW${cleanRw}-${cleanVillage}`;

    setLoading(true);

    try {
      if (supabase) {
        // Simpan data wilayah baru ke tabel 'tenants' di Supabase
        const { error: tenantError } = await supabase.from('tenants').insert([
          {
            tenant_code: generatedTenantCode,
            rt_number: cleanRt,
            rw_number: cleanRw,
            village_name: cleanVillage,
            status: 'ACTIVE',
          },
        ]);

        if (tenantError) {
          console.log('Error menyimpan tenant:', tenantError.message);
        }
      }

      setLoading(false);

      Alert.alert(
        '🎉 Wilayah Berhasil Dibuat!',
        `Kode Wilayah Resmi Anda:\n\n📌 ${generatedTenantCode}\n\nBagikan kode ini kepada warga Anda agar mereka bisa mendaftar dan masuk ke aplikasi.`,
        [
          {
            text: 'Gunakan Kode Ini Sekarang',
            onPress: () => navigation.navigate('Setup', { tenantCode: generatedTenantCode }),
          },
        ]
      );

    } catch (err) {
      setLoading(false);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mendaftarkan wilayah. Silakan coba lagi.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B579D" />

      {/* Frame Header Modern Melengkung */}
      <View style={styles.headerFrame}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
             
            }
          }} 
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>‹ Kembali</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Pendaftaran Wilayah RT</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>BUAT KODE UNIK BARU RT</Text>
          <Text style={styles.subTitle}>
            Khusus untuk Ketua RT atau Pengurus untuk mendaftarkan lingkungan wilayah pertama kalinya.
          </Text>

          <View style={styles.rowContainer}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Nomor RT:</Text>
              <TextInput
                style={styles.input}
                placeholder="000"
                placeholderTextColor="#94A3B8"
                value={rtNumber}
                onChangeText={(text) => setRtNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.label}>Nomor RW:</Text>
              <TextInput
                style={styles.input}
                placeholder="000"
                placeholderTextColor="#94A3B8"
                value={rwNumber}
                onChangeText={(text) => setRwNumber(text.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                maxLength={3}
              />
            </View>
          </View>

          <Text style={styles.label}>Nama Wilayah / Perumahan:</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Nama Kampung"
            placeholderTextColor="#94A3B8"
            value={villageName}
            onChangeText={(text) => setVillageName(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={15}
          />

          <Text style={styles.label}>Nama Lengkap Ketua RT:</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Bpk/Ibu ..."
            placeholderTextColor="#94A3B8"
            value={adminName}
            onChangeText={setAdminName}
          />

          <Text style={styles.label}>Nomor WhatsApp Ketua RT:</Text>
          <TextInput
            style={styles.input}
            placeholder="081xxx"
            placeholderTextColor="#94A3B8"
            value={adminPhone}
            onChangeText={setAdminPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Kata Sandi Akun Admin RT:</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Masukkan Kata Sandi"
              placeholderTextColor="#94A3B8"
              value={adminPassword}
              onChangeText={setAdminPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Text style={styles.eyeButtonText}>
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.btnSubmit} onPress={handleCreateTenant} activeOpacity={0.8} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.btnSubmitText}>GENERATE KODE & DAFTARKAN</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F6FA' 
  },
  headerFrame: { 
    backgroundColor: '#0B579D', 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 50, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backText: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  headerTitle: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 21 
  },
  scrollContent: { 
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  card: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    padding: 30, 
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginTop: 40,
  },
  title: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#0F172A',
    marginBottom: 6,
  },
  subTitle: { 
    fontSize: 14, 
    color: '#64748B', 
    marginBottom: 24,
    lineHeight: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#334155', 
    marginBottom: 8 
  },
  input: { 
    borderWidth: 1.5, 
    borderColor: '#CBD5E1', 
    borderRadius: 12, 
    paddingHorizontal: 16,
    paddingVertical: 16, 
    fontSize: 18, 
    marginBottom: 18, 
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginBottom: 24,
    paddingRight: 6,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#0F172A',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
  },
  eyeButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0B579D',
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
    fontSize: 17, 
    letterSpacing: 0.5 
  },
});