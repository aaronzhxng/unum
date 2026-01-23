import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import { ChevronLeft, MoreVertical, Plus } from "lucide-react-native";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function OfficialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router: Router = useRouter();
  const official = {
    name: "Alexandria Ocasio-Cortez",
    avatar: require("../../assets/officials_images/aoc.webp"),
    party: "D",
    role: "Representative, NY 14th District",
    bio: "Waitress turned Congresswoman for the Bronx and Queens. Grassroots elected, small-dollar supported. A better world is possible.",
    website: "ocasiocortez.com",
    congressHistory: [
      {
        term: "119th Congress (2025-Present)",
        role: "Representative, NY-14",
      },
      {
        term: "118th Congress (2023-2025)",
        role: "Representative, NY-14",
      },
      {
        term: "117th Congress (2021-2023)",
        role: "Representative, NY-14",
      },
      {
        term: "116th Congress (2019-2021)",
        role: "Representative, NY-14",
      },
    ],
    map: require("../../assets/maps/aoc.png"),
  };

  return (
    <View style={styles.screen}>
      {/* ← Add screen wrapper */}
      {/* Custom header */}
      <View style={styles.headerBar}>
        <ChevronLeft size={24} color="#535353" onPress={() => router.back()} />
        <View style={styles.headerRight}>
          <Plus size={24} color="#535353" />
          <MoreVertical size={24} color="#535353" />
        </View>
      </View>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <View style={styles.header}>
          {/* Role at top */}
          <Text style={styles.roleTop}>
            {official.party} · {official.role}
          </Text>

          {/* Centered image + name line */}
          <View style={styles.centeredRow}>
            <Image source={official.avatar} style={styles.avatar} />
            <Text style={styles.name}>{official.name}</Text>
          </View>
        </View>
        {/* Bio */}
        <View>
          <Text style={styles.bio}>{official.bio}</Text>
          <Text style={styles.website}>{official.website}</Text>
        </View>

        {/* Congress History */}
        <View style={styles.section}>
          <View style={styles.termRow}>
            <Text style={styles.sectionTitle}>Congress</Text>
            <Text style={styles.sectionTitle}>(2019 - Present)</Text>
          </View>
          {official.congressHistory.map((term) => (
            <View key={term.term} style={styles.termRow}>
              <Text style={styles.term}>{term.term}</Text>
              <Text style={styles.termRole}>{term.role}</Text>
            </View>
          ))}
        </View>
        <View style={styles.map}>
          <Image
            source={official.map}
            style={{
              width: "100%",
              height: 369,
              marginBottom: 96,
            }}
            resizeMode="cover"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    backgroundColor: "#fafafa",
  },
  header: {
    paddingBottom: 24,
  },
  roleTop: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "800",
    marginBottom: 24,
  },
  centeredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#008CFF",
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "800",
    flexShrink: 1,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    color: "#535353",
    marginBottom: 16,
  },
  website: {
    fontSize: 14,
    color: "#46AAD8",
    fontWeight: "500",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    flexDirection: "column",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#fafafa",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  termRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  term: {
    fontSize: 12,
    color: "#000",
    fontWeight: "600",
    flex: 1,
  },
  termRole: {
    fontSize: 12,
    color: "#000",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  map: {
    width: "100%",
    height: 369,
    borderRadius: 24,
    marginBottom: 96,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
});
