import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Gym App</ThemedText>

      <ThemedText type="subtitle">Your bodybuilding journey starts here.</ThemedText>

      <ThemedView style={styles.energyCard}>
        <ThemedText style={styles.energyLabel}>TODAY'S ENERGY</ThemedText>

        <ThemedText style={styles.energyValue}>Ready to train</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  energyCard: {
    marginTop: 32,
    padding: 20,
    borderRadius: 16,
  },
  energyLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  energyValue: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "700",
  },
});
