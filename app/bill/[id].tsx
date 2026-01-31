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
import FilterDropdown from "./components/FilterDropdown";
import SortDropdown from "./components/SortDropdown";
import VotingCard from "./components/VotingCard"; // Add this import
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
  // const [isFiltered, setIsFiltered] = useState(false);
  const [showAmendments, setShowAmendments] = useState(false);
  const [showAmendmentsSort, setShowAmendmentsSort] = useState(false);
  const [selectedAmendmentsSort, setSelectedAmendmentsSort] =
    useState("Most Recent");
  const [isFiltered, setIsFiltered] = useState(false);
  const [showChamberModal, setShowChamberModal] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState(["Bills"]);

  const [showPartyModal, setShowPartyModal] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState(["Congress"]);

  interface FilterOption {
    id: string;
    label: string;
  }

  const chamber: FilterOption[] = [
    { id: "house", label: "House" },
    { id: "senate", label: "Senate" },
  ];

  const party: FilterOption[] = [
    { id: "democrat", label: "Democrat" },
    { id: "republican", label: "Republican" },
    { id: "independent", label: "Independent" },
  ];

  const toggleChamber = (type: string) => {
    setSelectedChamber((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleParty = (policy: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policy)
        ? prev.filter((p) => p !== policy)
        : [...prev, policy],
    );
  };

  const handleCancel = () => {
    setSelectedChamber(["Bills"]);
    setSelectedPolicies(["Congress"]);
    setShowChamberModal(false);
    setShowPartyModal(false);
  };

  const handleApply = () => {
    const hasFilters =
      selectedChamber.length > 1 || selectedPolicies.length > 1;
    setIsFiltered(hasFilters);
    setShowChamberModal(false);
    setShowPartyModal(false);
  };

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

            {/* Amendments Section */}
            <View style={componentStyles.amendmentsSection}>
              <Pressable
                style={[
                  componentStyles.sectionHeader,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => {
                  setShowAmendments(!showAmendments);
                }}
              >
                {/* Left: Title/Button and filterdropdown*/}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      alignSelf: "flex-start",
                      // flexShrink: 1,
                      // flexGrow: 0,
                      height: 20, // ← Slightly shorter for icon
                      // justifyContent: "center",
                      // alignItems: "flex-start",
                      // backgroundColor: "blue",
                    }}
                  >
                    {!showAmendments ? (
                      <Text
                        style={[
                          componentStyles.detailTitle,
                          { lineHeight: 20 },
                        ]}
                      >
                        Amendments ({bill.amendments})
                      </Text>
                    ) : (
                      <Pressable
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                        onPress={() => {
                          setShowChamberModal(true);
                          setShowPartyModal(true);
                        }}
                      >
                        <Text
                          style={[
                            componentStyles.detailTitle,
                            { lineHeight: 15 },
                          ]}
                        >
                          Amendments ({bill.amendments})
                        </Text>
                        {showChamberModal || showPartyModal ? (
                          <ChevronUp size={14} color="#7B7C81" />
                        ) : (
                          <ChevronDown size={14} color="#7B7C81" />
                        )}
                      </Pressable>
                    )}
                  </View>
                </View>

                {/* Center: Sort button (only expanded) */}
                {showAmendments && (
                  <Pressable
                    style={componentStyles.sortButton}
                    onPress={(e) => {
                      e.stopPropagation();
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
                {/* Right Chevron */}
                <View // ← Outer View (not Pressable when collapsed)
                  style={{
                    width: 24,
                    height: 24,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                  pointerEvents={showAmendments ? "auto" : "none"} // ← KEY: Transparent when collapsed
                >
                  {showAmendments ? (
                    <Pressable // ← Only Pressable when expanded
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => setShowAmendments(false)}
                      style={{ position: "absolute" }} // Overlay effect
                    >
                      <ChevronUp size={20} color="#7B7C81" />
                    </Pressable>
                  ) : (
                    <ChevronDown size={20} color="#7B7C81" />
                  )}
                </View>
              </Pressable>

              {/* List only (no sectionRow needed) */}
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
                        {`${amendment.date} · ${amendment.summary}`}
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
          <View>
            <VotingCard
              chamberDate="US Senate - 2/27/25"
              votes={{
                yea: 52,
                yeaByParty: { democrat: 12, republican: 38, independent: 2 },
                nay: 47,
                nayByParty: { democrat: 35, republican: 11, independent: 1 },
                notVoting: 1,
                yeaPercent: 50,
                nayPercent: 47,
                notVotingPercent: 1,
                voters: [
                  {
                    name: "Chuck Schumer",
                    party: "D",
                    role: "Majority Leader, Senator, NY",
                    vote: "Nay",
                    photo: require("../../assets/officials_images/c_schumer.jpg"),
                  },
                  {
                    name: "Kirsten Gillibrand",
                    party: "D",
                    role: "Senator - New York",
                    vote: "Nay",
                    photo: require("../../assets/officials_images/k_gillibrand.webp"),
                  },
                  // Add more to test Yea/Rep
                ],
              }}
            />
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
      <FilterDropdown
        showChamberModal={showChamberModal}
        showPartyModal={showPartyModal}
        selectedChamber={selectedChamber}
        selectedPolicies={selectedPolicies}
        toggleChamber={toggleChamber}
        toggleParty={toggleParty}
        setShowChamberModal={setShowChamberModal}
        setShowPartyModal={setShowPartyModal}
        onCancel={handleCancel}
        onApply={handleApply}
        chamber={chamber}
        party={party}
      />
    </View>
  );
}
