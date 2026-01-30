import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Link,
  MoreVertical,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

// TODO: Create these components in bill/components/ later
// import BillSponsors from './components/BillSponsors';
// import ActionHistory from './components/ActionHistory';
// import AmendmentList from './components/AmendmentList';
import SortDropdown from "./components/SortDropdown";

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
  const [showAmendments, setShowAmendments] = useState(false);
  const [showAmendmentsSort, setShowAmendmentsSort] = useState(false);
  const [selectedAmendmentsSort, setSelectedAmendmentsSort] =
    useState("Most Recent");

  // Bill data (from HR5124.jpg)
  const bill = {
    id: "HR5124",
    avatar: require("../../assets/bills_icons/education.png"),
    name: "H.R.5124 - River's Law",
    introduced: "01/20/2025",
    status: "Introduced",
    committee: "House - Education and Workforce",
    sponsor: {
      role: "Rep.",
      name: "Ritchie Torres",
      party: "D",
      district: "NY-15",
    },
    type: "US House Bill",
    summary:
      "The bill amends the Child Care and Development Block Grant Act of 1990, participating child care providers covered by the bill would be prohibited from having a swimming pool on the premises of the child care facility, and would also require door and window alarms or similar safety devices to prevent children from wandering into dangerous areas, as a condition of receiving CCDBG funds.",
    amendments: 15,
    actions: [], // Actions tab data
    cosponsors: [], // Cosponsors tab data
  };

  const amendmentsList = [
    {
      title: "S.Amdt.327 to S.Amdt.348",
      date: "01/14/2026",
      sponsor: {
        role: "Sen.",
        name: "Ruben Gallego",
        party: "D",
        district: "AZ",
      },
      summary:
        "To require the Secretary of Defense to establish pilot program deploying microdrones.",
    },
    {
      title: "S.Amdt.326 to S.Amdt.348",
      date: "01/14/2026",
      sponsor: {
        role: "Sen.",
        name: "Jeff Merkley",
        party: "D",
        district: "OR",
      },
      summary:
        "For other uses of Federal law enforcement officers for crowd control.",
    },
    {
      title: "S.Amdt.325",
      date: "01/14/2026",
      sponsor: {
        role: "Sen.",
        name: "John Cornyn",
        party: "R",
        district: "TX",
      },
      summary:
        "To protect the national security of the United States by imposing public notification...",
    },
    // Add more from screenshot...
  ];

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
          <Pressable>
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={componentStyles.container}
        keyboardShouldPersistTaps="handled"
        // keyboardDismissMode="on-drag"
      >
        {/* Bill Header */}
        <View style={componentStyles.centeredRow}>
          <Image source={bill.avatar} style={componentStyles.avatar} />
          <Text style={componentStyles.billTitle}>{bill.name}</Text>
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
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Status: </Text>
              <Text style={componentStyles.status}>{bill.status}</Text>
            </View>
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Latest Action: </Text>
              <Text style={componentStyles.detailInfo}>{bill.introduced}</Text>
            </View>
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Introduced: </Text>
              <Text style={componentStyles.detailInfo}>{bill.introduced}</Text>
            </View>
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Committees: </Text>
              <Text style={componentStyles.detailInfo}>{bill.committee}</Text>
            </View>
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Sponsor: </Text>
              <Text style={componentStyles.detailInfo}>
                {`${bill.sponsor.role} ${bill.sponsor.name} [${bill.sponsor.party} - ${bill.sponsor.district}]`}
              </Text>
            </View>
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Type: </Text>
              <Text style={componentStyles.detailInfo}>{bill.type}</Text>
            </View>
            <View style={componentStyles.section}>
              <Text style={componentStyles.detailTitle}>Summary</Text>
              <Text style={componentStyles.summary}>{bill.summary}</Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 4,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#7B7C81",
                  padding: 6,
                  paddingHorizontal: 8,
                  borderRadius: 24,
                  alignSelf: "flex-start",
                }}
              >
                <Link size={14} color="#7B7C81" />
                <Text style={componentStyles.link}>H.R.5124</Text>
              </View>
            </View>
            <View style={componentStyles.amendmentsSection}>
              <Pressable
                style={componentStyles.sectionHeader}
                onPress={() => {
                  if (showAmendments) {
                    setShowAmendments(false); // Collapse
                  } else {
                    setShowAmendments(true); // Expand
                  }
                }}
              >
                <Text style={componentStyles.detailTitle}>
                  Amendments ({bill.amendments})
                </Text>
                <View style={componentStyles.sectionRow}>
                  {showAmendments && (
                    <Pressable
                      style={componentStyles.sortButton}
                      onPress={(e) => {
                        e.stopPropagation(); // ← CRUCIAL: Stop touch from reaching header
                        setShowAmendmentsSort(!showAmendmentsSort);
                      }}
                    >
                      <Text style={componentStyles.viewAll}>
                        {selectedAmendmentsSort}
                      </Text>
                      {showAmendmentsSort ? (
                        <ChevronUp size={16} color="#7B7C81" />
                      ) : (
                        <ChevronDown size={16} color="#7B7C81" />
                      )}
                    </Pressable>
                  )}

                  {/* Fixed width for expand/collapse chevron */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {showAmendments ? (
                      <ChevronUp
                        size={showAmendments ? 0 : 20}
                        color="#7B7C81"
                      />
                    ) : (
                      <ChevronDown size={20} color="#7B7C81" />
                    )}
                  </View>
                </View>
              </Pressable>

              {showAmendments && (
                <View style={componentStyles.expandedAmendments}>
                  {amendmentsList.map((amendment, index) => (
                    <View key={index} style={componentStyles.amendmentItem}>
                      <View style={componentStyles.amendmentTitleandSponsor}>
                        <Text style={componentStyles.detailTitle}>
                          {amendment.title}
                        </Text>
                        <Text style={componentStyles.amendmentSponsor}>
                          {`${amendment.sponsor.role} ${amendment.sponsor.name} [${amendment.sponsor.party} - ${amendment.sponsor.district}]`}
                        </Text>
                      </View>
                      <Text style={componentStyles.amendmentSummary}>
                        {`${amendment.date} : ${amendment.summary}`}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {/* Other tabs - simplified for now */}
        {activeTab === "voting" && (
          <View style={componentStyles.section}>
            <Text style={componentStyles.detailTitle}>Voting History</Text>
            <Text>Coming soon...</Text>
          </View>
        )}

        {activeTab === "actions" && (
          <View style={componentStyles.section}>
            <Text style={componentStyles.detailTitle}>Action History</Text>
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
      <SortDropdown
        showSortDropdown={showAmendmentsSort}
        setShowSortDropdown={setShowAmendmentsSort}
        selectedSort={selectedAmendmentsSort}
        setSelectedSort={setSelectedAmendmentsSort}
      />
    </View>
  );
}
