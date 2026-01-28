"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onIdTokenChanged, User, signOut } from "firebase/auth";
import { app } from "../lib/firebase";

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
  const auth = getAuth(app);

  useEffect(() => {
    return onIdTokenChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, [auth]);

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
