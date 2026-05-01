"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not initialized");
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (email: string, password: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not initialized");
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not initialized");
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Auth not initialized");
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}