import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import { ChevronLeft, MoreVertical, Search } from "lucide-react-native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, ScrollView, Text, View } from "react-native";

// TODO: Create these components in bill/components/ later
// import BillSponsors from './components/BillSponsors';
// import ActionHistory from './components/ActionHistory';
// import AmendmentList from './components/AmendmentList';

import { styles as componentStyles } from "./styles/components";

export default function BillDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter() as Router;

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "details" | "voting" | "actions" | "cosponsors"
  >("details");

  // Modals/Search (same as official)
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltered, setIsFiltered] = useState(false);

  // Bill data (from HR5124.jpg)
  const bill = {
    id: "HR5124",
    name: "H.R.5124 - River Law",
    introduced: "01/20/2025",
    status: "Introduced",
    committee: "House - Education and Workforce",
    sponsor: {
      name: "Rep. Ritchie Torres (D-NY-15)",
      party: "D",
      district: "NY-15",
    },
    summary:
      "The bill amends the Child Care and Development Block Grant Act of 1990 to require States to have policies in place to prevent children from areas with high risk of lead exposure from wandering into dangerous areas as a condition of receiving CCDBG funds.",
    amendments: 0,
    actions: [], // Actions tab data
    cosponsors: [], // Cosponsors tab data
    icon: require("../../assets/bills_icons/education.png"), // Adjust path
  };

  // Mock related bills/officials for tabs
  const mockRelatedOfficials = [
    {
      id: "1",
      name: "Alexandria Ocasio-Cortez",
      party: "D",
      role: "Co-Sponsor",
    },
    { id: "2", name: "Ritchie Torres", party: "D", role: "Sponsor" },
  ];

  const filteredOfficials = useMemo(() => {
    if (!searchQuery.trim()) return mockRelatedOfficials;
    return mockRelatedOfficials.filter((official) =>
      official.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={componentStyles.screen}>
      {/* Header Bar */}
      <View style={componentStyles.headerBar}>
        <ChevronLeft size={24} color="#535353" onPress={() => router.back()} />
        <View style={componentStyles.headerRight}>
          <Pressable onPress={() => setShowSearchModal(true)}>
            <Search size={24} color="#535353" />
          </Pressable>
          <Pressable>
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={componentStyles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Bill Header */}
        <View style={componentStyles.header}>
          <Text style={componentStyles.billNumber}>{bill.id}</Text>
          <Text style={componentStyles.billTitle}>{bill.name}</Text>
          <View style={componentStyles.statusRow}>
            <Text style={componentStyles.status}>{bill.status}</Text>
            <Text style={componentStyles.date}>
              Introduced {bill.introduced}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={componentStyles.tabsNegative}>
          <View style={componentStyles.tabs}>
            <Text
              style={[
                componentStyles.tab,
                activeTab === "details" && componentStyles.tabActive,
              ]}
              onPress={() => setActiveTab("details")}
            >
              Details
            </Text>
            <Text
              style={[
                componentStyles.tab,
                activeTab === "voting" && componentStyles.tabActive,
              ]}
              onPress={() => setActiveTab("voting")}
            >
              Voting
            </Text>
            <Text
              style={[
                componentStyles.tab,
                activeTab === "actions" && componentStyles.tabActive,
              ]}
              onPress={() => setActiveTab("actions")}
            >
              Actions
            </Text>
            <Text
              style={[
                componentStyles.tab,
                activeTab === "cosponsors" && componentStyles.tabActive,
              ]}
              onPress={() => setActiveTab("cosponsors")}
            >
              Cosponsors
            </Text>
          </View>
        </View>

        {/* Details Tab */}
        {activeTab === "details" && (
          <>
            <View style={componentStyles.section}>
              <Text style={componentStyles.sectionTitle}>Summary</Text>
              <Text style={componentStyles.summary}>{bill.summary}</Text>
            </View>

            <View style={componentStyles.section}>
              <Text style={componentStyles.sectionTitle}>Committee</Text>
              <Text style={componentStyles.committee}>{bill.committee}</Text>
            </View>

            <View style={componentStyles.section}>
              <Text style={componentStyles.sectionTitle}>Sponsor</Text>
              <View style={componentStyles.sponsorRow}>
                <Text style={componentStyles.sponsorName}>
                  {bill.sponsor.name}
                </Text>
                <Text style={componentStyles.sponsorParty}>
                  {bill.sponsor.party} - {bill.sponsor.district}
                </Text>
              </View>
            </View>

            <View style={componentStyles.section}>
              <Text style={componentStyles.sectionTitle}>Amendments</Text>
              <Text style={componentStyles.amendments}>
                {bill.amendments} Amendments
              </Text>
            </View>
          </>
        )}

        {/* Other tabs - simplified for now */}
        {activeTab === "voting" && (
          <View style={componentStyles.section}>
            <Text style={componentStyles.sectionTitle}>Voting History</Text>
            <Text>Coming soon...</Text>
          </View>
        )}

        {activeTab === "actions" && (
          <View style={componentStyles.section}>
            <Text style={componentStyles.sectionTitle}>Action History</Text>
            <Text>Coming soon...</Text>
          </View>
        )}

        {activeTab === "cosponsors" && (
          <View style={componentStyles.legislationHeader}>
            <FlatList
              style={componentStyles.legislationContainer}
              data={filteredOfficials}
              renderItem={({ item }) => (
                <Text>
                  {item.name} ({item.role})
                </Text> // Replace with OfficialCard later
              )}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </ScrollView>

      {/* Search Modal - reuse from official/components */}
      {/* <SearchModal 
        isVisible={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
      /> */}
    </View>
  );
}
