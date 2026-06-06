import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

import generatedConfig from '../firebase-applet-config.json';

const getFirebaseConfig = () => {
  if (typeof (window as any).__firebase_config !== 'undefined') {
    const config = (window as any).__firebase_config;
    return typeof config === 'string' ? JSON.parse(config) : config;
  }
  const metaConfig = document.querySelector<HTMLMetaElement>('meta[name="firebase-config"]');
  if (metaConfig?.content) {
    return JSON.parse(metaConfig.content);
  }
  return generatedConfig;
};

const firebaseConfig = getFirebaseConfig();

if (!firebaseConfig) {
  console.error('Firebase config not found');
}

const app = initializeApp(firebaseConfig || {});
export const auth = getAuth(app);
// Respect firestoreDatabaseId if it exists in the config (for AI studio integration)
export const db = (firebaseConfig as any)?.firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export default app;

// Connectivity check as outlined in the Firebase skill instructions
export async function testConnection(): Promise<boolean> {
  try {
    // try fetching a dummy document to verify firestore network
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (error?.code === 'auth/network-request-failed' || error.message?.includes('offline') || error.message?.includes('failed')) {
      console.error("Please check your Firebase configuration.", error);
    }
    return false; // Still returning false on failures to let App.tsx know
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
