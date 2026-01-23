import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import { ChevronLeft, MoreVertical, Plus } from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function OfficialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router: Router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "legislation">(
    "profile"
  );
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
  type Bill = {
    id: string;
    name: string;
    date: string;
    committee: string;
    update: string;
    icon: any; // No ?
  };

  const BillCard = ({ item }: { item: Bill }) => (
    <View style={styles.billCard}>
      <Image source={item.icon} style={styles.billIcon} />
      <View style={styles.billInfo}>
        <Text style={styles.billNumber}>{item.name}</Text>
        <View style={styles.billStatusRow}>
          <Text style={styles.billTitle}>{item.date}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.billTitle}>{item.committee}</Text>
          {item.update ? (
            <>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.update}>{item.update}</Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );

  const mockBills = [
    {
      id: "1",
      name: "H.R.6636 : To advance sensible pri..",
      date: "12/11/2025",
      committee: "Budget",
      update: "Introduced",
      icon: require("../../assets/bills_icons/budget.png"),
    },
    {
      id: "2",
      name: "SB2 : Foundation School Program",
      date: "2/27/2025",
      committee: "Rules",
      update: "In Progress",
      icon: require("../../assets/bills_icons/rules.png"),
    },
    {
      id: "3",
      name: "H.R.6819 : To reduce State adminis..",
      date: "12/17/2025",
      committee: "Education & Workforce",
      update: "Introduced",
      icon: require("../../assets/bills_icons/education.png"),
    },
  ];

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

        {/* Tabs - full width */}
        <View style={styles.tabsNegative}>
          <View style={styles.tabs}>
            <Text
              style={[styles.tab, activeTab === "profile" && styles.tabActive]}
              onPress={() => setActiveTab("profile")}
            >
              Profile
            </Text>
            <Text
              style={[
                styles.tab,
                activeTab === "legislation" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("legislation")}
            >
              Legislation
            </Text>
          </View>
        </View>

        {activeTab === "profile" ? (
          <>
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
          </>
        ) : (
          <View>
            <View>
              <Text>Total Legislation - 3,353</Text>
            </View>
            <FlatList
              data={mockBills}
              renderItem={({ item }) => <BillCard item={item} />}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
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
    paddingBottom: 16,
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
  tabsNegative: {
    marginHorizontal: -16,
    marginBottom: 24,
  },
  tabs: {
    flexDirection: "row",
    gap: 64,
    paddingLeft: 32,
    borderBottomWidth: 2,
    borderBottomColor: "#bfbfbf",
  },
  tab: {
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  tabActive: {
    color: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginBottom: -2,
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
  billCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    margin: 2,
    borderRadius: 24,
    backgroundColor: "#fafafa",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  billIcon: {
    width: 50,
    height: 50,
    borderRadius: 32,
    backgroundColor: "#eee",
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
  },
  billNumber: {
    fontSize: 15,
    color: "#535353",
    fontWeight: "600",
    marginBottom: 2,
  },
  billTitle: {
    fontSize: 12,
    color: "#7B7C81",
  },
  billStatusRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
    marginTop: 2,
  },
  separator: {
    // ← NEW, exact official match
    fontSize: 12,
    color: "#000000",
    marginHorizontal: 4,
  },
  update: {
    // ← NEW, exact official match
    fontSize: 12,
    color: "#000000",
    fontWeight: 600,
  },
});
