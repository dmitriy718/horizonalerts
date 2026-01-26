import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020617" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: "#e2e8f0", fontSize: 22, fontWeight: "600" }}>
          Horizon Services
        </Text>
        <Text style={{ color: "#94a3b8", marginTop: 12 }}>
          Members-only trade alerts. Educational only. No execution.
        </Text>
        <View
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            backgroundColor: "#0f172a"
          }}
        >
          <Text style={{ color: "#e2e8f0", fontWeight: "600" }}>
            Live Alerts
          </Text>
          <Text style={{ color: "#94a3b8", marginTop: 8 }}>
            Connect to the API to view real-time alerts.
          </Text>
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}
