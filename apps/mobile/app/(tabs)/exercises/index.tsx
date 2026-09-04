import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function ExercisesScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Exercises</ThemedText>

      <ThemedText type="subtitle">Your exercise library will appear here.</ThemedText>
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
