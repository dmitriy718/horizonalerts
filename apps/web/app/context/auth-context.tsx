"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onIdTokenChanged, User, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirebaseAuth } from "../lib/firebase";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  logOut: () => Promise<void>;
}>({
  user: null,
  loading: true,
  logOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    return onIdTokenChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const logOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
    router.push("/auth");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
