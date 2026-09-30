import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { subscribePendingUsers, updateUserStatus } from '../services/adminService';

export default function AdminDashboardScreen({ tenantCode, navigation }) {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    if (!tenantCode) return;
    const unsubscribe = subscribePendingUsers(tenantCode, (data) => {
      setPendingUsers(data);
    });
    return () => unsubscribe();
  }, [tenantCode]);

  const handleApprove = async (userId, name) => {
    const res = await updateUserStatus(tenantCode, userId, 'approved');
    if (res.success) {
      Alert.alert('Berhasil', `Akun warga ${name} telah diverifikasi.`);
    } else {
      Alert.alert('Gagal', res.message);
    }
  };

  const handleReject = async (userId, name) => {
    const res = await updateUserStatus(tenantCode, userId, 'rejected');
    if (res.success) {
      Alert.alert('Ditolak', `Pendaftaran ${name} ditolak.`);
    } else {
      Alert.alert('Gagal', res.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header dengan Tombol Kembali */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>⬅️ Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Panel Pengurus RT</Text>
        <Text style={styles.headerSub}>Wilayah: {tenantCode || 'RT-RW'}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>
          Persetujuan Warga Baru ({pendingUsers.length})
        </Text>

        {pendingUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Belum ada permohonan warga baru.</Text>
          </View>
        ) : (
          <FlatList
            data={pendingUsers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userDetails}>{item.block} • {item.phone}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnReject]}
                    onPress={() => handleReject(item.id, item.name)}
                  >
                    <Text style={styles.btnText}>Tolak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.btnApprove]}
                    onPress={() => handleApprove(item.id, item.name)}
                  >
                    <Text style={styles.btnText}>Setujui</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  header: {
    backgroundColor: '#0B579D',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    marginBottom: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  userDetails: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  btnReject: {
    backgroundColor: '#EF4444',
  },
  btnApprove: {
    backgroundColor: '#10B981',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});