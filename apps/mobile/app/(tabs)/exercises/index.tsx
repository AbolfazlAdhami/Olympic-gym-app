import { StyleSheet, Text, View } from "react-native";

export default function ExercisesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercises</Text>
      <Text style={styles.subtitle}>Your exercise library will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
});
