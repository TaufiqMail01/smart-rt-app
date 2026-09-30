import { 
  collection, 
  doc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../config/supabase';

// 1. Stream Warga Pending Realtime
export const subscribePendingUsers = (tenantCode, onUpdate) => {
  try {
    const usersRef = collection(db, 'tenants', tenantCode, 'users');
    const q = query(usersRef, where('status', '==', 'pending'));

    return onSnapshot(q, (snapshot) => {
      const pendingUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onUpdate(pendingUsers);
    });
  } catch (error) {
    onUpdate([]);
  }
};

// 2. Setujui/Tolak Warga
export const updateUserStatus = async (tenantCode, userId, newStatus) => {
  try {
    const userDocRef = doc(db, 'tenants', tenantCode, 'users', userId);
    await updateDoc(userDocRef, {
      status: newStatus,
      verifiedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
};