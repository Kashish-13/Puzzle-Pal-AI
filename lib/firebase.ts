import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";

const clean = (val?: string) => (val ? val.trim() : "");

const authDomain = clean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
const rawProjectId = clean(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Guard against invalid placeholder project IDs (e.g. 'puzzlepal-12345') or missing projectId
const projectId =
  rawProjectId && !rawProjectId.includes("12345") && !rawProjectId.includes("your_")
    ? rawProjectId
    : authDomain
    ? authDomain.replace(".firebaseapp.com", "")
    : "puzzlepal-5385d";

const firebaseConfig = {
  apiKey: clean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: authDomain || `${projectId}.firebaseapp.com`,
  projectId: projectId,
  storageBucket: clean(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) || `${projectId}.firebasestorage.app`,
  messagingSenderId: clean(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: clean(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);

// Use auto-detect long polling in browser to gracefully handle networks where WebSockets are blocked
let firestoreDb: Firestore;
try {
  firestoreDb =
    typeof window !== "undefined"
      ? initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
        })
      : getFirestore(app);
} catch {
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;
export default app;
