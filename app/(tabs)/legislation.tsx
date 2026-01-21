import { StyleSheet, Text, View } from "react-native";

export default function LegislationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Legislation</Text>
      <Text>List of House and Senate bills will go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 16,
  },
});
