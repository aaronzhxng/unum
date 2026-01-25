import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import BillCard from "./components/BillCard";
import FilterDropdown from "./components/FilterDropdown";
import SortDropdown from "./components/SortDropdown";
import { styles as componentStyles } from "./styles/components";

export default function OfficialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router: Router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "legislation">(
    "profile"
  );
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most Viewed");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [selectedType, setSelectedType] = useState("Bills");

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(["Bills"]);

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState(["Congress"]);

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePolicy = (policy: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policy)
        ? prev.filter((p) => p !== policy)
        : [...prev, policy]
    );
  };

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
    {
      id: "4",
      name: "H.R.6819 : To reduce State adminis..",
      date: "12/17/2025",
      committee: "Education & Workforce",
      update: "Introduced",
      icon: require("../../assets/bills_icons/education.png"),
    },
    {
      id: "5",
      name: "H.R.6819 : To reduce State adminis..",
      date: "12/17/2025",
      committee: "Education & Workforce",
      update: "Introduced",
      icon: require("../../assets/bills_icons/education.png"),
    },
    {
      id: "6",
      name: "H.R.6819 : To reduce State adminis..",
      date: "12/17/2025",
      committee: "Education & Workforce",
      update: "Introduced",
      icon: require("../../assets/bills_icons/education.png"),
    },
    {
      id: "7",
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
            <View style={styles.legislationHeader}>
              <View style={styles.legislationHeaderLeft}>
                <Pressable
                  style={styles.sortButton}
                  onPress={() => {
                    setShowTypeModal(true);
                    setShowPolicyModal(true);
                  }}
                >
                  <Text style={styles.legislationHeaderTotal}>
                    {/* {selectedType} */}
                    Total Legislation : 3,353
                  </Text>
                  {showTypeDropdown ? (
                    <ChevronUp
                      size={24}
                      color="#535353"
                      style={{ marginRight: 24 }}
                    />
                  ) : (
                    <ChevronDown
                      size={24}
                      color="#535353"
                      style={{ marginRight: 24 }}
                    />
                  )}
                </Pressable>
                <Pressable
                  style={styles.sortButton}
                  onPress={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {/* <Text style={styles.sortText}>Sort by </Text> */}
                  <Text style={styles.sortText}>{selectedSort}</Text>
                  <Text>
                    {showSortDropdown ? (
                      <ChevronUp
                        size={24}
                        color="#535353"
                        style={{ marginRight: 24 }}
                      />
                    ) : (
                      <ChevronDown
                        size={24}
                        color="#535353"
                        style={{ marginRight: 24 }}
                      />
                    )}
                  </Text>
                </Pressable>
              </View>
              <Search size={24} color="#535353" />
            </View>
            <FlatList
              style={componentStyles.legislationContainer}
              data={mockBills}
              renderItem={({ item }) => <BillCard item={item} />}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
            <SortDropdown
              showSortDropdown={showSortDropdown}
              setShowSortDropdown={setShowSortDropdown}
              selectedSort={selectedSort}
              setSelectedSort={setSelectedSort}
            />
            <FilterDropdown
              showTypeModal={showTypeModal}
              showPolicyModal={showPolicyModal}
              selectedTypes={selectedTypes}
              selectedPolicies={selectedPolicies}
              toggleType={toggleType}
              togglePolicy={togglePolicy}
              setShowTypeModal={setShowTypeModal}
              setShowPolicyModal={setShowPolicyModal}
              styles={styles}
              onCancel={() => {
                // Reset selections if needed
                setShowTypeModal(false);
                setShowPolicyModal(false);
              }}
              onApply={() => {
                // Apply filters, close modals
                setShowTypeModal(false);
                setShowPolicyModal(false);
              }}
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
  legislationHeader: {
    paddingHorizontal: 4,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    alignItems: "center",
  },
  legislationHeaderTotal: {
    fontWeight: 700,
    fontSize: 16,
    marginRight: 4,
    alignItems: "center",
  },
  legislationHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40, // Or height: 40, reserves button space
  },
  sortText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#000",
    maxWidth: 72,
  },
  modalOverlay: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#000000",
  },
  dropdownItemTextLabel: {
    fontSize: 16,
    color: "#7B7C81",
    marginTop: 16,
    marginBottom: 6,
    marginHorizontal: 16,
  },
  dropdownMulti: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 8,
    margin: 16,
    marginTop: 180,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    marginLeft: 16,
  },
});
