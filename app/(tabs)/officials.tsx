import { StyleSheet, Text, View } from "react-native";

export default function OfficialsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elected Officials</Text>
      <Text>Filter by federal or state officials here.</Text>
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
