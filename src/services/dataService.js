import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// ============================================================================
// 1. ADUAN WARGA (REPORT SERVICE)
// ============================================================================

// Kirim Laporan Aduan Baru
export const submitReport = async (tenantCode, reportData) => {
  try {
    const reportsRef = collection(db, 'tenants', tenantCode, 'reports');
    const docRef = await addDoc(reportsRef, {
      title: reportData.title,
      description: reportData.description,
      category: reportData.category, // misal: 'Fasilitas', 'Keamanan', 'Kebersihan'
      userName: reportData.userName,
      userBlock: reportData.userBlock,
      userId: reportData.userId,
      status: 'PENDING', // 'PENDING', 'PROSES', 'SELESAI'
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Stream Realtime Laporan Aduan Warga
export const subscribeReports = (tenantCode, onUpdate) => {
  const reportsRef = collection(db, 'tenants', tenantCode, 'reports');
  const q = query(reportsRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(reports);
  });
};

// ============================================================================
// 2. SURAT PENGANTAR DIGITAL (SERVICES)
// ============================================================================

// Buat Permohonan Surat Baru
export const requestLetter = async (tenantCode, letterData) => {
  try {
    const lettersRef = collection(db, 'tenants', tenantCode, 'letters');
    const docRef = await addDoc(lettersRef, {
      letterType: letterData.letterType, // misal: 'Surat Pengantar KTP', 'Surat Dominasi'
      purpose: letterData.purpose,
      userName: letterData.userName,
      userBlock: letterData.userBlock,
      userId: letterData.userId,
      status: 'MENUNGGU_VERIFIKASI', // 'MENUNGGU_VERIFIKASI', 'DISETUJUI', 'DITOLAK'
      createdAt: serverTimestamp(),
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// ============================================================================
// 3. KAS & KEUANGAN RT (FINANCE SERVICE)
// ============================================================================

// Stream Realtime Laporan Keuangan RT
export const subscribeFinances = (tenantCode, onUpdate) => {
  const financesRef = collection(db, 'tenants', tenantCode, 'finances');
  const q = query(financesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    onUpdate(items);
  });
};