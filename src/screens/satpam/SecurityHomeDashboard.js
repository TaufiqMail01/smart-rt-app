import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, RefreshControl, TouchableOpacity, TextInput, Linking, Alert } from 'react-native';
import { supabase } from '../../config/supabase';

export default function SecurityHomeDashboard({ user, tenantCode }) {
  const [stats, setStats] = useState({
    activeGuests: 0,
    totalTodayGuests: 0,
    patrolStatus: 'Aman Terkendali'
  });
  const [loading, setLoading] = useState(false);
  const [shiftNote, setShiftNote] = useState('');
  const [savedNote, setSavedNote] = useState('Nihil / Belum ada catatan khusus dari shift sebelumnya.');

  const fetchSecurityStats = async () => {
    try {
      setLoading(true);

      // 1. Hitung tamu aktif
      const { count: activeCount, error: errActive } = await supabase
        .from('guest_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_code', tenantCode || 'UMUM')
        .eq('status', 'active');

      if (errActive) console.log('Info guest_logs:', errActive.message);

      // 2. Hitung total tamu hari ini
      const today = new Date().toISOString().split('T')[0];
      const { count: totalCount, error: errTotal } = await supabase
        .from('guest_logs')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_code', tenantCode || 'UMUM')
        .gte('check_in', `${today}T00:00:00`);

      if (errTotal) console.log('Info guest_logs:', errTotal.message);

      setStats({
        activeGuests: activeCount || 0,
        totalTodayGuests: totalCount || 0,
        patrolStatus: 'Aman & Siaga'
      });
    } catch (err) {
      console.error('Gagal memuat statistik satpam:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityStats();
  }, [tenantCode]);

  // Fungsi menyimpan catatan shift
  const handleSaveNote = () => {
    if (!shiftNote.trim()) {
      Alert.alert('Perhatian', 'Catatan kosong tidak dapat disimpan.');
      return;
    }
    setSavedNote(shiftNote.trim());
    setShiftNote('');
    Alert.alert('Sukses', 'Catatan operan shift berhasil diperbarui.');
  };

  // Fungsi pintasan darurat
  const handleEmergencyCall = (phoneNumber, label) => {
    const url = `tel:${phoneNumber}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          Alert.alert('Peringatan', `Perangkat tidak mendukung panggilan ke ${label}`);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('Gagal membuka telepon:', err));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchSecurityStats} colors={['#0B579D']} />}
      >
        {/* 1. Banner Utama Pos Jaga */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerBadge}>POS UTAMA KLASTER {tenantCode || 'UMUM'}</Text>
          <Text style={styles.bannerTitle}>Selamat Bertugas, {user?.name || 'Komandan Satpam'}</Text>
          <Text style={styles.bannerDesc}>
            Pastikan seluruh keluar masuk tamu dan kendaraan tercatat dengan teliti demi keamanan lingkungan warga.
          </Text>
        </View>

        {/* 2. Metrik / Statistik Operasional Pos */}
        <Text style={styles.sectionHeader}>Status Pos Penjagaan Hari Ini</Text>
        <View style={styles.metricsContainer}>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.activeGuests}</Text>
            <Text style={styles.metricLabel}>Tamu Masih di Dalam</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.totalTodayGuests}</Text>
            <Text style={styles.metricLabel}>Total Kunjungan Hari Ini</Text>
          </View>

          <View style={styles.metricCardWide}>
            <Text style={styles.metricValueGreen}>{stats.patrolStatus}</Text>
            <Text style={styles.metricLabel}>Kondisi Keamanan Klaster</Text>
          </View>

        </View>

        {/* 3. Instruksi Operasional */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📌 Instruksi Operasional</Text>
          <Text style={styles.infoText}>
            • Selalu tanyakan keperluan dan identitas setiap tamu yang masuk.{'\n'}
            • Periksa nomor plat kendaraan pengantar atau kurir.{'\n'}
            • Gunakan menu <Text style={styles.bold}>Buku Tamu</Text> di bawah untuk melihat riwayat data tamu secara real-time.
          </Text>
        </View>

        {/* 4. Fitur Baru: Catatan / Operan Shift Antar Petugas (Huruf Besar & Jelas) */}
        <View style={styles.shiftCard}>
          <Text style={styles.cardTitleBig}>📝 Catatan / Operan Shift</Text>
          <Text style={styles.cardSubtitle}>Pesan aktif untuk regu penjagaan berikutnya:</Text>
          
          <View style={styles.noteDisplayBox}>
            <Text style={styles.noteDisplayText}>"{savedNote}"</Text>
          </View>

          <TextInput
            style={styles.inputNote}
            placeholder="Ketik catatan atau pesan shift di sini..."
            placeholderTextColor="#94A3B8"
            value={shiftNote}
            onChangeText={setShiftNote}
            multiline
          />

          <TouchableOpacity style={styles.btnSaveNote} onPress={handleSaveNote} activeOpacity={0.8}>
            <Text style={styles.btnSaveText}>Simpan Catatan Shift</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Fitur Baru: Pintasan Cepat Kontak Darurat Warga & Pengurus */}
        <View style={styles.emergencyCard}>
          <Text style={styles.cardTitleBigRed}>🚨 Pintasan Darurat Lingkungan</Text>
          <Text style={styles.cardSubtitle}>Tekan tombol di bawah untuk langsung menghubungi kontak penting:</Text>
          
          <View style={styles.emergencyButtonsRow}>
            <TouchableOpacity 
              style={styles.btnEmergencyRed} 
              onPress={() => handleEmergencyCall('112', 'Darurat Umum')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnEmergencyText}>Darurat (112)</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.btnEmergencyBlue} 
              onPress={() => handleEmergencyCall('08123456789', 'Ketua RT')}
              activeOpacity={0.8}
            >
              <Text style={styles.btnEmergencyText}> Ketua RT</Text>
            </TouchableOpacity>
          </View>
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
  scrollContent: { 
    padding: 16, 
    paddingBottom: 40,
    paddingTop: 10, 
  },
  bannerCard: { 
    backgroundColor: '#0B579D', 
    padding: 20, 
    borderRadius: 14, 
    marginBottom: 20, 
    marginTop: 32, 
    elevation: 3 
  },
  bannerBadge: { 
    fontSize: 12, 
    fontWeight: 'bold', 
    color: '#93C5FD', 
    marginBottom: 6, 
    letterSpacing: 1 
  },
  bannerTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#FFFFFF', 
    marginBottom: 8 
  },
  bannerDesc: { 
    fontSize: 15, 
    color: '#E0F2FE', 
    lineHeight: 22 
  },
  sectionHeader: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#1E293B', 
    marginBottom: 12 
  },
  metricsContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  metricCard: { 
    width: '48%', 
    backgroundColor: '#FFFFFF', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  metricCardWide: { 
    width: '100%', 
    backgroundColor: '#FFFFFF', 
    padding: 18, 
    borderRadius: 12, 
    marginBottom: 12, 
    elevation: 2, 
    borderWidth: 1, 
    borderColor: '#E2E8F0' 
  },
  metricValue: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#0F172A', 
    marginBottom: 4 
  },
  metricValueGreen: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#166534', 
    marginBottom: 4 
  },
  metricLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#64748B' 
  },
  infoBox: { 
    backgroundColor: '#FFFFFF', 
    padding: 20, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#E2E8F0',
    elevation: 2,
    marginBottom: 16 
  },
  infoTitle: { 
    fontSize: 17, 
    fontWeight: 'bold', 
    color: '#1E293B', 
    marginBottom: 8 
  },
  infoText: { 
    fontSize: 15, 
    color: '#475569', 
    lineHeight: 24 
  },
  bold: { 
    fontWeight: 'bold', 
    color: '#0B579D' 
  },
  // Gaya Kartu Catatan Shift (Huruf Besar & Jelas)
  shiftCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    marginBottom: 16,
  },
  cardTitleBig: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0B579D',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  noteDisplayBox: {
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 4,
    borderLeftColor: '#0B579D',
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  noteDisplayText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 22,
  },
  inputNote: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: '#F8FAFC',
    color: '#1E293B',
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  btnSaveNote: {
    backgroundColor: '#0B579D',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Gaya Kartu Darurat
  emergencyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    elevation: 2,
  },
  cardTitleBigRed: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  btnEmergencyRed: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
    elevation: 1,
  },
  btnEmergencyBlue: {
    flex: 1,
    backgroundColor: '#0B579D',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
    elevation: 1,
  },
  btnEmergencyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  }
});