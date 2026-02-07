// Firebase client wrapper.
// Typed helpers for scan history, saved places, and user settings.

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBxEXofdNra1JU9IZjgmz29-WXPlBmkGRE',
  authDomain: 'sightassist-39145.firebaseapp.com',
  projectId: 'sightassist-39145',
  storageBucket: 'sightassist-39145.firebasestorage.app',
  messagingSenderId: '547292334020',
  appId: '1:547292334020:web:04f02fb7341f985159c691',
};

let db: Firestore | null = null;

const ensureApp = (): Firestore | null => {
  try {
    if (!db) {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      db = getFirestore(app);
    }
    return db;
  } catch (err) {
    console.warn('Firebase init error:', err);
    return null;
  }
};

export type ScanRecord = {
  type: 'text' | 'objects' | 'scene' | 'safety';
  content: string;
  createdAt: number;
};

type PlaceRecord = {
  name: string;
  latitude: number;
  longitude: number;
  createdAt: number;
};

// ---------------------------------------------------------------------------
// Scans (History)
// ---------------------------------------------------------------------------

export const saveScan = async (scan: ScanRecord): Promise<void> => {
  try {
    const database = ensureApp();
    if (!database) return;
    await addDoc(collection(database, 'scans'), scan);
  } catch (err) {
    console.warn('saveScan error:', err);
  }
};

export const getHistory = async (maxItems = 50): Promise<(ScanRecord & { id: string })[]> => {
  try {
    const database = ensureApp();
    if (!database) return [];
    const q = query(collection(database, 'scans'), orderBy('createdAt', 'desc'), limit(maxItems));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ScanRecord) }));
  } catch (err) {
    console.warn('getHistory error:', err);
    return [];
  }
};

// ---------------------------------------------------------------------------
// Places (Memory)
// ---------------------------------------------------------------------------

export const savePlace = async (place: PlaceRecord): Promise<void> => {
  try {
    const database = ensureApp();
    if (!database) return;
    await addDoc(collection(database, 'places'), place);
  } catch (err) {
    console.warn('savePlace error:', err);
  }
};

export const getPlaces = async (): Promise<(PlaceRecord & { id: string })[]> => {
  try {
    const database = ensureApp();
    if (!database) return [];
    const q = query(collection(database, 'places'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as PlaceRecord) }));
  } catch (err) {
    console.warn('getPlaces error:', err);
    return [];
  }
};

