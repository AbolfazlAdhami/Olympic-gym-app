import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import { getExercises, type Exercise } from "@/src/api/exercises";

export default function ExercisesScreen() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExercises() {
      try {
        setLoading(true);
        setError(null);

        const response = await getExercises();
        console.log(response);
        setExercises(response.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load exercises");
      } finally {
        setLoading(false);
      }
    }

    loadExercises();
  }, []);

  if (loading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator />
        <ThemedText>Loading exercises...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.center}>
        <ThemedText type="title">Exercises</ThemedText>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Exercises</ThemedText>

      <ThemedText style={styles.count}>{exercises.length} exercises</ThemedText>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ThemedView style={styles.item}>
            <ThemedText type="title">{item.name}</ThemedText>

            <ThemedText>{item.equipment ?? "No equipment"}</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
  },

  count: {
    marginTop: 8,
    marginBottom: 16,
  },

  list: {
    gap: 12,
    paddingBottom: 24,
  },

  item: {
    padding: 16,
    borderRadius: 12,
    gap: 4,
  },
});
