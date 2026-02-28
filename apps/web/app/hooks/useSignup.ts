import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "../lib/firebase";
import { getApiBaseUrl } from "../lib/api";

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  age: string;
  zipCode: string;
  preferences?: Record<string, any>;
}

const firebaseErrors: Record<string, string> = {
  "email-already-in-use": "Email already in use.",
  "weak-password": "Password should be at least 6 characters.",
  "invalid-email": "Please enter a valid email address.",
  "too-many-requests": "Too many attempts. Please try again later.",
  "network-request-failed": "Network error. Please check your connection.",
  "operation-not-allowed": "Sign-up is temporarily disabled.",
};

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const auth = getFirebaseAuth();

  const signup = async (data: SignupData, redirectTo = "/dashboard") => {
    setLoading(true);
    setError("");

    if (!auth) {
      setError("Auth not initialized");
      setLoading(false);
      return false;
    }

    let cred: any = null;

    try {
      // 1. Create Firebase User
      cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const token = await cred.user.getIdToken();

      // 2. Sync to Backend
      const res = await fetch(`${getApiBaseUrl()}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          age: Number(data.age),
          zipCode: data.zipCode,
          preferences: data.preferences || {}
        })
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        // Roll back: delete the Firebase user we just created
        try { await cred.user.delete(); } catch { /* best effort */ }
        throw new Error(json.error || "Failed to create account. Please try again.");
      }

      // 3. Success
      router.push(redirectTo);
      return true;

    } catch (err: any) {
      console.error("Signup Error:", err);
      const msg = err.message || "";

      // Map Firebase errors to user-friendly messages
      for (const [key, friendlyMsg] of Object.entries(firebaseErrors)) {
        if (msg.includes(key)) {
          setError(friendlyMsg);
          return false;
        }
      }

      // Generic fallback — never show raw error details
      setError(msg.includes("Failed to") ? msg : "An error occurred. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}
