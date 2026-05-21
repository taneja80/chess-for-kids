import { db, auth, rtdb } from './firebase';
import {
  doc, setDoc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import {
  signInAnonymously, onAuthStateChanged, User
} from 'firebase/auth';
import {
  ref, set, get, onValue, off, update, push
} from 'firebase/database';
export interface PlayerProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  goldCoins?: number;
  badges?: string[];
  createdAt?: number;
  updatedAt?: unknown;
}

// ---- AUTH ----
export function signInAnon(): Promise<User> {
  return signInAnonymously(auth).then((cred) => cred.user);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

// ---- PROFILE ----
export async function loadProfile(uid: string): Promise<PlayerProfile | null> {
  const snap = await getDoc(doc(db, 'profiles', uid));
  return snap.exists() ? (snap.data() as PlayerProfile) : null;
}

export async function saveProfile(profile: PlayerProfile): Promise<void> {
  await setDoc(doc(db, 'profiles', profile.uid), { ...profile, updatedAt: serverTimestamp() });
}

export async function updateProfile(uid: string, data: Partial<PlayerProfile>): Promise<void> {
  await updateDoc(doc(db, 'profiles', uid), { ...data, updatedAt: serverTimestamp() });
}

// ---- MULTIPLAYER ----
export interface RoomData {
  white: string;
  black?: string;
  whiteName: string;
  blackName?: string;
  fen: string;
  lastMove?: { from: string; to: string };
  status: 'waiting' | 'playing' | 'done';
  winner?: string;
  createdAt: number;
}

export async function createRoom(whiteUid: string, whiteName: string): Promise<string> {
  const roomRef = push(ref(rtdb, 'rooms'));
  const roomId = roomRef.key!;
  const data: RoomData = {
    white: whiteUid,
    whiteName,
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    status: 'waiting',
    createdAt: Date.now(),
  };
  await set(roomRef, data);
  return roomId;
}

export async function joinRoom(
  roomId: string,
  blackUid: string,
  blackName: string
): Promise<boolean> {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return false;
  const data = snap.val() as RoomData;
  if (data.status !== 'waiting') return false;
  await update(roomRef, { black: blackUid, blackName, status: 'playing' });
  return true;
}

export async function pushMove(
  roomId: string,
  fen: string,
  lastMove: { from: string; to: string }
): Promise<void> {
  await update(ref(rtdb, `rooms/${roomId}`), { fen, lastMove });
}

export function subscribeRoom(
  roomId: string,
  callback: (data: RoomData) => void
) {
  const roomRef = ref(rtdb, `rooms/${roomId}`);
  onValue(roomRef, (snap) => {
    if (snap.exists()) callback(snap.val() as RoomData);
  });
  return () => off(roomRef);
}

export async function setRoomStatus(
  roomId: string,
  status: 'done',
  winner?: string
): Promise<void> {
  await update(ref(rtdb, `rooms/${roomId}`), { status, winner });
}
