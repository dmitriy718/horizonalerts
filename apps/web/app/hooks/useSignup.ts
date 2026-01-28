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

    try {
      // 1. Create Firebase User
      const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
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
        const json = await res.json();
        throw new Error(json.error || "Failed to sync profile.");
      }

      // 3. Success
      router.push(redirectTo);
      return true;

    } catch (err: any) {
      console.error("Signup Error:", err);
      // Map Firebase errors to user-friendly messages
      let msg = err.message;
      if (msg.includes("email-already-in-use")) msg = "Email already in use.";
      if (msg.includes("weak-password")) msg = "Password should be at least 6 characters.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error };
}
