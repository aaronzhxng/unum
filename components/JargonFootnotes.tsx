// components/JargonFootnotes.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { findJargonInText, JargonEntry } from "../constants/politicalJargon";

interface JargonFootnotesProps {
  text: string;
}

export default function JargonFootnotes({ text }: JargonFootnotesProps) {
  if (!text || typeof text !== "string") return null;
  const entries: JargonEntry[] = findJargonInText(text);

  if (entries.length === 0) return null;

  return (
    <View style={styles.container}>
      {entries.map(({ term, definition }) => (
        <View key={term} style={styles.entry}>
          <Text style={styles.term}>
            {capitalize(term)} ·{" "}
            <Text style={styles.definition}>{definition}</Text>
          </Text>
          {/* <Text style={styles.definition}>{definition}</Text> */}
        </View>
      ))}
    </View>
  );
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  entry: {
    marginBottom: 8,
    // paddingLeft: 4,
  },
  term: {
    fontSize: 12,
    fontWeight: 600,
    color: "#535353",
    marginBottom: 2,
  },
  definition: {
    fontWeight: 400,
    fontSize: 12,
    color: "#535353",
    lineHeight: 19,
  },
});
