import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function WorkoutsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Workouts</ThemedText>

      <ThemedText type="subtitle">Your workout plans will appear here.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
});
