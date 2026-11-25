import { getApp, getApps, initializeApp, onLog } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  doc,
  enableNetwork,
  getDocFromServer,
  getFirestore,
  setLogLevel,
} from "firebase/firestore";
import firebaseConfig from "../../../firebase-applet-config.json";

export const OWNER_ADMIN_EMAIL = "abahafc@gmail.com";
export const FIREBASE_PROJECT_ID = firebaseConfig.projectId;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Prevent Firestore SDK's hardcoded 10s OnlineStateTracker timeout from emitting
// fatal console.error logs during transient slow handshakes or brief offline states,
// while still forwarding all other Firestore SDK errors to console.error.
setLogLevel("silent");
onLog(
  (entry) => {
    if (entry.type !== "@firebase/firestore") return;
    if (entry.message.includes("Could not reach Cloud Firestore backend.")) {
      console.warn(`[${entry.type}] ${entry.message}`);
      return;
    }
    console.error(`[${entry.type}] ${entry.message}`);
  },
  { level: "error" }
);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export type FirebaseReachabilityStatus =
  | "ok"
  | "config_error"
  | "backend_unavailable"
  | "network_offline";

export async function isFirebaseConfigReachableCheck(
  config: {
    projectId: string;
    firestoreDatabaseId: string;
    apiKey: string;
  } = firebaseConfig
): Promise<FirebaseReachabilityStatus> {
  if (!config.projectId || !config.firestoreDatabaseId || !config.apiKey) {
    return "config_error";
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const endpoint = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
      config.projectId
    )}/databases/${encodeURIComponent(
      config.firestoreDatabaseId
    )}/documents/test/connection?key=${encodeURIComponent(config.apiKey)}`;
    const response = await fetch(endpoint, {
      method: "GET",
      signal: controller.signal,
    });
    if (response.status === 400) {
      return "config_error";
    }
    if (response.status === 404) {
      try {
        const body = (await response.json()) as {
          error?: { message?: string };
        };
        const msg = body?.error?.message?.toLowerCase() ?? "";
        // A missing document ("document ... not found") means the project & database exist.
        // A missing database or project ("database ... does not exist") is a config error.
        if (msg.includes("document") && msg.includes("not found")) {
          return "ok";
        }
      } catch {
        // Unable to inspect 404 body; treat as config error below.
      }
      return "config_error";
    }
    if (response.status === 429 || response.status >= 500) {
      return "backend_unavailable";
    }
    return "ok";
  } catch {
    return "network_offline";
  } finally {
    clearTimeout(timer);
  }
}

let inFlightConnectionTest: Promise<void> | null = null;

export async function testConnection(): Promise<void> {
  if (inFlightConnectionTest) return inFlightConnectionTest;
  inFlightConnectionTest = (async () => {
    try {
      await getDocFromServer(doc(db, "test", "connection"));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("the client is offline")
      ) {
        const status = await isFirebaseConfigReachableCheck();
        if (status === "config_error") {
          console.error("Please check your Firebase configuration.");
        } else if (status === "network_offline") {
          console.warn(
            "Cloud Firestore is currently unreachable from this network; continuing with cached/local data until online."
          );
        } else {
          console.warn(
            "Cloud Firestore initial connection took longer than expected; continuing with local data while reconnecting."
          );
        }
      }
    } finally {
      inFlightConnectionTest = null;
    }
  })();
  return inFlightConnectionTest;
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    void enableNetwork(db).then(() => testConnection());
  });

  if (typeof navigator === "undefined" || navigator.onLine !== false) {
    void testConnection();
  }
}
