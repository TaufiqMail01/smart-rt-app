import { db } from '../config/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';

// 1. Ambil Semua Pengumuman RT dari Database
export const fetchAnnouncements = async () => {
  try {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const announcements = [];
    querySnapshot.forEach((doc) => {
      announcements.push({ id: doc.id, ...doc.data() });
    });
    return announcements;
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
};

// 2. Tambah Pengumuman Baru (Khusus Akses Pengurus / RT)
export const createAnnouncement = async (title, content, urgency = 'Biasa') => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      title,
      content,
      urgency,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding announcement:', error);
    throw error;
  }
};