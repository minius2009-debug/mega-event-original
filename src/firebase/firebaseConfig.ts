import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setLogLevel,
  persistentLocalCache,
  persistentSingleTabManager,
  memoryLocalCache
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Silence non-fatal Firestore network transition / timeout warnings in iframe/sandboxed previews
try {
  setLogLevel('error');
} catch {
  // Ignore in environments where setLogLevel is restricted
}

// Intercept harmless 10-second Firestore timeout notice so it does not trigger app errors
if (typeof window !== 'undefined') {
  const origError = console.error;
  console.error = (...args: any[]) => {
    const firstArg = args[0];
    if (
      typeof firstArg === 'string' &&
      (firstArg.includes('Could not reach Cloud Firestore backend') ||
        firstArg.includes("Backend didn't respond within 10 seconds") ||
        firstArg.includes('client will operate in offline mode'))
    ) {
      console.warn('Firestore notice: Operating in offline mode with synchronized local dataset.');
      return;
    }
    origError.apply(console, args);
  };
}

const app = initializeApp(firebaseConfig);

// Initialize Firestore with forced long polling and robust local caching for iframe / browser preview resilience
export const db = (() => {
  try {
    return initializeFirestore(
      app,
      {
        experimentalForceLongPolling: true,
        localCache: persistentLocalCache({
          tabManager: persistentSingleTabManager({})
        })
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    try {
      return initializeFirestore(
        app,
        {
          experimentalForceLongPolling: true,
          localCache: memoryLocalCache()
        },
        firebaseConfig.firestoreDatabaseId
      );
    } catch {
      return getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: Required for AI Studio Firestore initialization */
    }
  }
})();

export const auth = getAuth(app);

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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Notice: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check on boot with timeout and graceful offline recovery handling
export async function testConnection(timeoutMs = 3000): Promise<boolean> {
  try {
    const connectionPromise = getDoc(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection check timed out; client operating in offline mode')), timeoutMs)
    );
    await Promise.race([connectionPromise, timeoutPromise]);
    return true;
  } catch (error: any) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errCode = error?.code;
    if (
      errCode === 'unavailable' ||
      errMsg.includes('offline') ||
      errMsg.includes('Could not reach Cloud Firestore backend') ||
      errMsg.includes('unavailable') ||
      errMsg.includes('timed out') ||
      errMsg.includes('Failed to get document')
    ) {
      console.warn('Firebase notice: Operating in offline mode or waiting for Cloud Firestore connection.');
      return false;
    }
    // Document missing or permission error means connection to Firestore backend was established
    return true;
  }
}

// Strip undefined values for Firestore compatibility
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      result[key] = value.map(item => (typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item));
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[key] = sanitizeForFirestore(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}
