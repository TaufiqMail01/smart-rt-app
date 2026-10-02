import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Share,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../../config/supabase';

export default function GuestQrScreen({ user, tenantCode, navigation }) {
  // Form State Utama
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestType, setGuestType] = useState('Biasa'); // 'Biasa', 'Menginap', 'Servis'
  const [visitPurpose, setVisitPurpose] = useState('');

  // State Detail Kendaraan
  const [vehicleType, setVehicleType] = useState('Motor'); // 'Motor', 'Mobil', 'Jalan'
  const [guestCount, setGuestCount] = useState('1');

  // 3 Kolom NOPOL (Plat Nomor)
  const [platePrefix, setPlatePrefix] = useState('B'); // Kode Depan (Huruf)
  const [plateNumber, setPlateNumber] = useState('');  // Nomor Polisi (Angka)
  const [plateSuffix, setPlateSuffix] = useState('');  // Kode Belakang (Huruf)

  // Ref Input untuk Pindah Fokus Otomatis
  const plateNumberRef = useRef(null);
  const plateSuffixRef = useRef(null);

  // State Result & DB
  const [generatedQrValue, setGeneratedQrValue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guestHistory, setGuestHistory] = useState([]);

  // Fetch Riwayat Laporan Tamu dari Supabase
  const fetchGuestHistory = async () => {
    try {
      if (supabase && user?.id) {
        const { data, error } = await supabase
          .from('guest_permits')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setGuestHistory(data);
        }
      }
    } catch (err) {
      console.log('Error fetch guest history:', err);
    }
  };

  useEffect(() => {
    fetchGuestHistory();
  }, [user]);

  const handleReportGuest = async () => {
    if (!guestName.trim()) {
      Alert.alert('Peringatan', 'Harap isi Nama Lengkap Tamu terlebih dahulu.');
      return;
    }

    // Gabungkan 3 Kolom NOPOL
    const fullPlate = vehicleType !== 'Jalan'
      ? `${platePrefix.trim().toUpperCase()} ${plateNumber.trim()} ${plateSuffix.trim().toUpperCase()}`.trim()
      : 'Jalan Kaki';

    if (vehicleType !== 'Jalan' && (!platePrefix.trim() || !plateNumber.trim())) {
      Alert.alert('Peringatan', 'Harap isi Plat Nomor Kendaraan (Kode Depan & Angka).');
      return;
    }

    setLoading(true);

    const reportCode = `LAPOR-${guestType.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const qrPayload = JSON.stringify({
      code: reportCode,
      host_name: user?.name || 'Warga',
      block: user?.block || '-',
      guest_name: guestName.trim(),
      phone: guestPhone.trim() || '-',
      type: guestType,
      vehicle: `${vehicleType} (${fullPlate})`,
      total_guest: guestCount || '1',
      purpose: visitPurpose.trim() || 'Kunjungan Warga',
      created_at: new Date().toISOString(),
    });

    try {
      if (supabase) {
        await supabase.from('guest_permits').insert([
          {
            permit_code: reportCode,
            tenant_code: tenantCode || 'RT006-RW012-KEDIP',
            user_id: user?.id,
            guest_name: guestName.trim(),
            guest_phone: guestPhone.trim(),
            vehicle_info: `${vehicleType} - ${fullPlate}`,
            guest_count: parseInt(guestCount) || 1,
            purpose: `[Tamu ${guestType}] ${visitPurpose.trim()}`,
            status: 'PENDING',
          },
        ]);
        fetchGuestHistory();
      }
    } catch (err) {
      console.log('Error saving guest report:', err);
    }

    setLoading(false);
    setGeneratedQrValue(qrPayload);
  };

  const handleReset = () => {
    setGuestName('');
    setGuestPhone('');
    setVisitPurpose('');
    setGuestType('Biasa');
    setVehicleType('Motor');
    setPlatePrefix('B');
    setPlateNumber('');
    setPlateSuffix('');
    setGuestCount('1');
    setGeneratedQrValue(null);
  };

  const handleShareQr = async () => {
    const fullPlate = `${platePrefix.toUpperCase()} ${plateNumber} ${plateSuffix.toUpperCase()}`;
    try {
      await Share.share({
        message: `Halo ${guestName}, kedatangan Anda telah dilaporkan oleh ${user?.name || 'Warga'} (${user?.block || 'RT'}).\nKendaraan: ${vehicleType} (${fullPlate})\nTunjukkan Bukti QR ini saat melintasi Pos Jaga Satpam.`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F3F6FA" />

      {/* Header Bar Navigation dengan Tombol Kembali 3D */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.btnBack3D}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.btnBackText}>Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Tamu Wajib Lapor</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerWrapper}>
          {!generatedQrValue ? (
            /* FORM LAPOR TAMU SUPER LENGKAP */
            <View style={styles.card}>
              <View style={styles.cardTitleBox}>
                <Text style={styles.cardIconHeader}>🏠</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardHeaderTitle}>Form Lapor Tamu RT</Text>
                  <Text style={styles.cardHeaderSub}>
                    Laporkan kedatangan keluarga / kerabat demi keamanan dan ketertiban lingkungan RT.
                  </Text>
                </View>
              </View>

              {/* 1. KATEGORI KUNJUNGAN TAMU (3 KOLOM) */}
              <Text style={styles.sectionLabel}>1. Kategori Kunjungan Tamu:</Text>
              <View style={styles.threeColumnRow}>
                <TouchableOpacity
                  style={[styles.threeColumnBox, guestType === 'Biasa' && styles.columnBoxActive]}
                  onPress={() => setGuestType('Biasa')}
                >
                  <Text style={styles.columnIcon}>👥</Text>
                  <Text style={[styles.columnText, guestType === 'Biasa' && styles.columnTextActive]}>
                    Tamu Biasa
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.threeColumnBox, guestType === 'Menginap' && styles.columnBoxActive]}
                  onPress={() => setGuestType('Menginap')}
                >
                  <Text style={styles.columnIcon}>🌙</Text>
                  <Text style={[styles.columnText, guestType === 'Menginap' && styles.columnTextActive]}>
                    Menginap
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.threeColumnBox, guestType === 'Servis' && styles.columnBoxActive]}
                  onPress={() => setGuestType('Servis')}
                >
                  <Text style={styles.columnIcon}>🚚</Text>
                  <Text style={[styles.columnText, guestType === 'Servis' && styles.columnTextActive]}>
                    Kurir/Servis
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 2. DATA UTAMA TAMU */}
              <Text style={styles.sectionLabel}>2. Identitas Tamu:</Text>
              <Text style={styles.label}>Nama Lengkap Tamu: *</Text>
              <TextInput
                style={styles.inputLarge}
                placeholder="Contoh: Pak Ahmad / Ibu Maria"
                value={guestName}
                onChangeText={setGuestName}
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Nomor WhatsApp / HP Tamu:</Text>
              <TextInput
                style={styles.inputLarge}
                placeholder="Contoh: 08123456789"
                value={guestPhone}
                onChangeText={setGuestPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#94A3B8"
              />

              {/* 3. JENIS KENDARAAN (3 KOLOM) */}
              <Text style={styles.sectionLabel}>3. Jenis Kendaraan Tamu:</Text>
              <View style={styles.threeColumnRow}>
                <TouchableOpacity
                  style={[styles.threeColumnBox, vehicleType === 'Motor' && styles.columnBoxActive]}
                  onPress={() => setVehicleType('Motor')}
                >
                  <Text style={styles.columnIcon}>🛵</Text>
                  <Text style={[styles.columnText, vehicleType === 'Motor' && styles.columnTextActive]}>
                    Sepeda Motor
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.threeColumnBox, vehicleType === 'Mobil' && styles.columnBoxActive]}
                  onPress={() => setVehicleType('Mobil')}
                >
                  <Text style={styles.columnIcon}>🚗</Text>
                  <Text style={[styles.columnText, vehicleType === 'Mobil' && styles.columnTextActive]}>
                    Mobil / R4
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.threeColumnBox, vehicleType === 'Jalan' && styles.columnBoxActive]}
                  onPress={() => setVehicleType('Jalan')}
                >
                  <Text style={styles.columnIcon}>🚶</Text>
                  <Text style={[styles.columnText, vehicleType === 'Jalan' && styles.columnTextActive]}>
                    Jalan Kaki
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 4. NOPOL TERBAGI MENJADI 3 KOLOM */}
              {vehicleType !== 'Jalan' && (
                <>
                  <Text style={styles.label}>Plat Nomor Kendaraan (NOPOL): *</Text>
                  <View style={styles.nopolContainer}>
                    {/* Kode Depan */}
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subLabelCenter}>DEPAN</Text>
                      <TextInput
                        style={styles.nopolInput}
                        placeholder="B"
                        value={platePrefix}
                        onChangeText={(text) => {
                          const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
                          setPlatePrefix(cleaned);
                          if (cleaned.length >= 2) plateNumberRef.current?.focus();
                        }}
                        maxLength={2}
                        autoCapitalize="characters"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                    <Text style={styles.nopolDash}>-</Text>

                    {/* Nomor Polisi */}
                    <View style={{ flex: 2 }}>
                      <Text style={styles.subLabelCenter}>ANGKA</Text>
                      <TextInput
                        ref={plateNumberRef}
                        style={styles.nopolInput}
                        placeholder="1234"
                        value={plateNumber}
                        onChangeText={(text) => {
                          const cleaned = text.replace(/[^0-9]/g, '');
                          setPlateNumber(cleaned);
                          if (cleaned.length >= 4) plateSuffixRef.current?.focus();
                        }}
                        keyboardType="number-pad"
                        maxLength={4}
                        placeholderTextColor="#94A3B8"
                      />
                    </View>

                    <Text style={styles.nopolDash}>-</Text>

                    {/* Kode Belakang */}
                    <View style={{ flex: 1.5 }}>
                      <Text style={styles.subLabelCenter}>BELAKANG</Text>
                      <TextInput
                        ref={plateSuffixRef}
                        style={styles.nopolInput}
                        placeholder="KED"
                        value={plateSuffix}
                        onChangeText={(text) => {
                          const cleaned = text.toUpperCase().replace(/[^A-Z]/g, '');
                          setPlateSuffix(cleaned);
                        }}
                        maxLength={4}
                        autoCapitalize="characters"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Input Jumlah Tamu */}
              <Text style={styles.label}>Jumlah Rombongan Tamu (Orang):</Text>
              <TextInput
                style={[styles.inputLarge, { width: 120 }]}
                placeholder="1"
                value={guestCount}
                onChangeText={(t) => setGuestCount(t.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholderTextColor="#94A3B8"
              />

              {/* Input Keperluan */}
              <Text style={styles.label}>Keperluan / Keterangan Kunjungan:</Text>
              <TextInput
                style={[styles.inputLarge, { height: 90, textAlignVertical: 'top' }]}
                placeholder="Contoh: Silaturahmi keluarga / Perbaikan AC / Menginap 2 hari"
                value={visitPurpose}
                onChangeText={setVisitPurpose}
                multiline
                placeholderTextColor="#94A3B8"
              />

              {/* Tombol Lapor Tamu */}
              <TouchableOpacity
                style={styles.btnPrimaryLarge}
                onPress={handleReportGuest}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnPrimaryTextLarge}>KIRIM LAPORAN TAMU & BUAT QR</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* BUKTI LAPOR TAMU (QR CODE) */
            <View style={styles.cardQrResult}>
              <Text style={styles.qrTitle}>BUKTI LAPOR TAMU TERDAFTAR</Text>
              <Text style={styles.qrSubtitle}>Laporan telah diteruskan ke Pos Satpam & Pengurus RT</Text>

              <View style={styles.qrCodeBox}>
                <QRCode value={generatedQrValue} size={220} />
              </View>

              <View style={styles.guestDetailBox}>
                <Text style={styles.guestDetailName}>👤 Tamu: {guestName}</Text>
                <Text style={styles.guestDetailSub}>🏷️ Kategori: Tamu {guestType}</Text>
                <Text style={styles.guestDetailSub}>
                  🚘 Kendaraan: {vehicleType !== 'Jalan' ? `${vehicleType} (${platePrefix.toUpperCase()} ${plateNumber} ${plateSuffix.toUpperCase()})` : 'Jalan Kaki'}
                </Text>
                <Text style={styles.guestDetailSub}>👥 Jumlah: {guestCount} Orang</Text>
                {guestPhone !== '' && <Text style={styles.guestDetailSub}>📞 No. HP: {guestPhone}</Text>}
                <Text style={styles.guestDetailSub}>📌 Ket: {visitPurpose || 'Silaturahmi'}</Text>
              </View>

              <TouchableOpacity style={styles.btnShareLarge} onPress={handleShareQr} activeOpacity={0.8}>
                <Text style={styles.btnShareText}>📲 BAGIKAN BUKTI LAPOR KE TAMU</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnResetLarge} onPress={handleReset} activeOpacity={0.8}>
                <Text style={styles.btnResetText}>+ Laporkan Tamu Lainnya</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* WADAH RIWAYAT LAPOR TAMU */}
          {guestHistory && guestHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={styles.historyTitle}>📋 Riwayat Laporan Tamu Saya</Text>
              {guestHistory.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historyGuestName}>{item.guest_name}</Text>
                    <Text style={styles.historyPurpose}>
                      {item.vehicle_info ? `${item.vehicle_info} • ` : ''}{item.purpose || '-'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'CHECKED_IN' ? styles.statusCheckedIn : styles.statusPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        item.status === 'CHECKED_IN' ? styles.statusCheckedInText : styles.statusPendingText,
                      ]}
                    >
                      {item.status === 'CHECKED_IN' ? '✅ Terverifikasi' : '⏳ Terlaporkan'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },

  /* 🟢 TOMBOL KEMBALI 3D (TANPA PANAH) */
  btnBack3D: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 14,
    borderBottomWidth: 4,
    borderBottomColor: '#0369A1', // Efek Kedalaman 3D
    borderRightWidth: 1,
    borderRightColor: '#0284C7',
    elevation: 4,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  btnBackText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  topBarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 50,
  },
  centerWrapper: {
    width: '100%',
  },

  /* Card Form */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardIconHeader: {
    fontSize: 32,
    marginRight: 12,
  },
  cardHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B579D',
  },
  cardHeaderSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 18,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284C7',
    marginTop: 6,
    marginBottom: 10,
  },

  /* 3 Kolom Pilihan */
  threeColumnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  threeColumnBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  columnBoxActive: {
    backgroundColor: '#0B579D',
    borderColor: '#0B579D',
  },
  columnIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  columnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
    textAlign: 'center',
  },
  columnTextActive: {
    color: '#FFFFFF',
  },

  /* Styling 3 Kolom NOPOL (Plat Nomor) */
  nopolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  subLabelCenter: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#0284C7',
    textAlign: 'center',
    marginBottom: 4,
  },
  nopolInput: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
  },
  nopolDash: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginHorizontal: 6,
    marginTop: 14,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  inputLarge: {
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 16,
  },

  btnPrimaryLarge: {
    backgroundColor: '#0B579D',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  btnPrimaryTextLarge: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  /* QR Result Card */
  cardQrResult: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B579D',
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  qrCodeBox: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    elevation: 2,
    marginBottom: 20,
  },
  guestDetailBox: {
    width: '100%',
    backgroundColor: '#F0F9FF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  guestDetailName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0369A1',
    marginBottom: 4,
  },
  guestDetailSub: {
    fontSize: 13,
    color: '#0284C7',
    marginTop: 2,
  },

  btnShareLarge: {
    backgroundColor: '#22C55E',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnShareText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  btnResetLarge: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  btnResetText: {
    color: '#475569',
    fontWeight: 'bold',
    fontSize: 14,
  },

  /* Wadah Riwayat Tamu */
  historyContainer: {
    marginTop: 24,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 1,
  },
  historyGuestName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  historyPurpose: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusPendingText: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 11,
  },
  statusCheckedIn: {
    backgroundColor: '#DCFCE7',
  },
  statusCheckedInText: {
    color: '#15803D',
    fontWeight: 'bold',
    fontSize: 11,
  },
});