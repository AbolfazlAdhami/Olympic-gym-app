import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gym App</Text>

      <Text style={styles.subtitle}>Your bodybuilding journey starts here.</Text>

      <Link href="/exercises" style={styles.link}>
        Browse Exercises
      </Link>
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
  link: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "600",
  },
});
