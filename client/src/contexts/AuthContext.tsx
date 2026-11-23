import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  OWNER_ADMIN_EMAIL,
} from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  authReady: boolean;
  isOwnerAdmin: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isListedAdmin, setIsListedAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (cancelled) return;
      setUser(nextUser);

      if (!nextUser) {
        setIsListedAdmin(false);
        setAuthReady(true);
        return;
      }

      const emailVerified = nextUser.emailVerified === true;
      const isOwner =
        emailVerified &&
        nextUser.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase();

      if (isOwner) {
        setIsListedAdmin(true);
        setAuthReady(true);
        return;
      }

      if (!emailVerified) {
        setIsListedAdmin(false);
        setAuthReady(true);
        return;
      }

      const adminDocPath = `admins/${nextUser.uid}`;
      try {
        const snap = await getDoc(doc(db, "admins", nextUser.uid));
        if (!cancelled) {
          setIsListedAdmin(snap.exists());
        }
      } catch (error) {
        if (!cancelled) {
          setIsListedAdmin(false);
        }
        // Expected permission-denied for non-admin signed-in users unless doc matches uid
        console.warn("Admin verification check:", error);
      } finally {
        if (!cancelled) {
          setAuthReady(true);
        }
      }
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const isOwnerAdmin = Boolean(
    user &&
      user.emailVerified === true &&
      user.email?.toLowerCase() === OWNER_ADMIN_EMAIL.toLowerCase()
  );

  const isAdmin = Boolean(isOwnerAdmin || (user?.emailVerified && isListedAdmin));

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "auth/signOut");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isOwnerAdmin,
        isAdmin,
        signInWithGoogle,
        signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
