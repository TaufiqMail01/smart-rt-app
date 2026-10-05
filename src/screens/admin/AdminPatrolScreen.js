import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TextInput, TouchableOpacity, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { supabase } from '../../config/supabase';

export default function AdminPatrolScreen({ tenantCode }) {
  const [patrols, setPatrols] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State Form Jadwal Ronda
  const [groupName, setGroupName] = useState('');
  const [scheduleDay, setScheduleDay] = useState('');
  const [members, setMembers] = useState('');

  const fetchPatrols = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patrol_schedules')
        .select('*')
        .eq('tenant_code', tenantCode || 'UMUM')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatrols(data || []);
    } catch (err) {
      console.error('Gagal memuat jadwal ronda:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPatrols();
  }, [tenantCode]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatrols();
  };

  const handleAddPatrol = async () => {
    if (!groupName.trim() || !scheduleDay.trim()) {
      Alert.alert('Perhatian', 'Nama kelompok dan hari ronda wajib diisi!');
      return;
    }

    try {
      const { error } = await supabase.from('patrol_schedules').insert([
        {
          tenant_code: tenantCode || 'UMUM',
          group_name: groupName.trim(),
          schedule_day: scheduleDay.trim(),
          members: members.trim() || '-',
          created_at: new Date()
        }
      ]);

      if (error) throw error;

      Alert.alert('Sukses', 'Jadwal ronda berhasil ditambahkan.');
      setGroupName('');
      setScheduleDay('');
      setMembers('');
      fetchPatrols();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const handleDeletePatrol = async (id) => {
    try {
      const { error } = await supabase.from('patrol_schedules').delete().eq('id', id);
      if (error) throw error;
      fetchPatrols();
    } catch (err) {
      Alert.alert('Gagal', err.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🛡️ {item.group_name}</Text>
      <Text style={styles.cardDetail}>📅 Hari: <Text style={styles.bold}>{item.schedule_day}</Text></Text>
      <Text style={styles.cardDetail}>👥 Anggota: {item.members}</Text>

      <TouchableOpacity 
        style={styles.btnDelete} 
        onPress={() => handleDeletePatrol(item.id)}
      >
        <Text style={styles.btnDeleteText}>Hapus Jadwal</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Tambah Jadwal Ronda</Text>

        <Text style={styles.label}>Nama Kelompok / Regu</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Regu A / RT 01"
          placeholderTextColor="#94A3B8"
          value={groupName}
          onChangeText={setGroupName}
        />

        <Text style={styles.label}>Hari Tugas</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Sabtu Malam Minggu"
          placeholderTextColor="#94A3B8"
          value={scheduleDay}
          onChangeText={setScheduleDay}
        />

        <Text style={styles.label}>Daftar Nama Warga</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Budi, Joko, Andi"
          placeholderTextColor="#94A3B8"
          value={members}
          onChangeText={setMembers}
        />

        <TouchableOpacity style={styles.btnSubmit} onPress={handleAddPatrol}>
          <Text style={styles.btnText}>Simpan Jadwal</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={patrols}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0B579D']} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FA' },
  formCard: { backgroundColor: '#FFFFFF', padding: 14, margin: 16, borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 8 },
  label: { fontSize: 11, fontWeight: 'bold', color: '#334155', marginBottom: 2, marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, fontSize: 12, backgroundColor: '#F8FAFC', color: '#1E293B' },
  btnSubmit: { backgroundColor: '#0B579D', padding: 10, borderRadius: 6, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 12 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  cardTitle: { fontSize: 13, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  cardDetail: { fontSize: 11, color: '#334155', marginBottom: 2 },
  bold: { fontWeight: '600', color: '#0F172A' },
  btnDelete: { backgroundColor: '#EF4444', paddingVertical: 4, borderRadius: 4, alignItems: 'center', marginTop: 8 },
  btnDeleteText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' }
});