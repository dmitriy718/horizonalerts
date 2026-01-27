import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
  Pressable
} from "react-native";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      setStatus(
        result.user.emailVerified
          ? "Signed in. Email verified."
          : "Signed in. Please verify your email."
      );
    } catch {
      setStatus("Sign-in failed.");
    }
  };

  const handleRegister = async () => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(result.user);
      setStatus("Account created. Check email to verify.");
    } catch {
      setStatus("Sign-up failed.");
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setStatus("Signed out.");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#05070f" }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        <View
          style={{
            backgroundColor: "#0b1220",
            borderRadius: 16,
            padding: 18,
            borderWidth: 1,
            borderColor: "#1f2937"
          }}
        >
          <Text style={{ color: "#cbd5f5", fontSize: 12, letterSpacing: 2 }}>
            HORIZON SERVICES
          </Text>
          <Text
            style={{
              color: "#f8fafc",
              fontSize: 26,
              fontWeight: "700",
              marginTop: 6
            }}
          >
            Trade alerts built for precision
          </Text>
          <Text style={{ color: "#94a3b8", marginTop: 10 }}>
            Non‑repainting signals, transparent provenance, and risk‑aware exits.
          </Text>
          <View
            style={{
              marginTop: 14,
              flexDirection: "row",
              gap: 10,
              flexWrap: "wrap"
            }}
          >
            {["Closed‑bar only", "Immutable audit", "No execution"].map((item) => (
              <View
                key={item}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: "#1f2937"
                }}
              >
                <Text style={{ color: "#cbd5f5", fontSize: 11 }}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginTop: 18, gap: 12 }}>
          <View
            style={{
              backgroundColor: "#111827",
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: "#1f2937"
            }}
          >
            <Text style={{ color: "#e2e8f0", fontWeight: "600" }}>
              Live alerts
            </Text>
            <Text style={{ color: "#94a3b8", marginTop: 6 }}>
              Consensus‑verified signals with SL/TP tiers and confidence scoring.
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {[
              { title: "Playbooks", body: "Wealth · Income · Preservation" },
              { title: "Guardrails", body: "Loss caps + cool‑off" }
            ].map((item) => (
              <View
                key={item.title}
                style={{
                  flex: 1,
                  backgroundColor: "#0f172a",
                  borderRadius: 14,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#1f2937"
                }}
              >
                <Text style={{ color: "#e2e8f0", fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text style={{ color: "#94a3b8", marginTop: 6, fontSize: 12 }}>
                  {item.body}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 14,
            backgroundColor: "#0f172a",
            borderWidth: 1,
            borderColor: "#1f2937"
          }}
        >
          <Text style={{ color: "#e2e8f0", fontWeight: "600" }}>Sign in</Text>
          <TextInput
            placeholder="Email"
            placeholderTextColor="#64748b"
            style={{
              marginTop: 10,
              backgroundColor: "#0b1220",
              color: "#e2e8f0",
              padding: 12,
              borderRadius: 10
            }}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            style={{
              marginTop: 10,
              backgroundColor: "#0b1220",
              color: "#e2e8f0",
              padding: 12,
              borderRadius: 10
            }}
            value={password}
            onChangeText={setPassword}
          />
          <View style={{ flexDirection: "row", marginTop: 12, gap: 10 }}>
            <Pressable
              onPress={handleLogin}
              style={{
                backgroundColor: "#6366f1",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Sign in</Text>
            </Pressable>
            <Pressable
              onPress={handleRegister}
              style={{
                borderColor: "#334155",
                borderWidth: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10
              }}
            >
              <Text style={{ color: "#e2e8f0" }}>Create</Text>
            </Pressable>
            <Pressable
              onPress={handleSignOut}
              style={{
                borderColor: "#334155",
                borderWidth: 1,
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 10
              }}
            >
              <Text style={{ color: "#e2e8f0" }}>Sign out</Text>
            </Pressable>
          </View>
          {status ? (
            <Text style={{ color: "#94a3b8", marginTop: 10 }}>{status}</Text>
          ) : null}
        </View>

        <View
          style={{
            marginTop: 18,
            padding: 16,
            borderRadius: 14,
            backgroundColor: "#0b1220",
            borderWidth: 1,
            borderColor: "#1f2937"
          }}
        >
          <Text style={{ color: "#e2e8f0", fontWeight: "600" }}>
            Safety first
          </Text>
          <Text style={{ color: "#94a3b8", marginTop: 6 }}>
            Educational alerts only. No trade execution. Signals are immutable and
            time‑stamped for auditability.
          </Text>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
