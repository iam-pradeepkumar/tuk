import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass the firestoreDatabaseId for custom/named enterprise Firestore databases
// Using initializeFirestore with experimentalForceLongPolling to fix "Could not reach Cloud Firestore backend" in sandboxed environments
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);


