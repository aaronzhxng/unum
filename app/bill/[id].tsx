import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  MoreVertical,
  Plus,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import NewListNameModal from "../global_components/NewListNameModal";
import { billsService } from "../services/bills";
import ActionHistory from "./bill_components/ActionHistory";
import AddModal from "./bill_components/AddModal";
import Cosponsors, { Cosponsor } from "./bill_components/Cosponsors";
import FilterDropdown from "./bill_components/FilterDropdown";
import OptionsModal from "./bill_components/OptionsModal";
import SortDropdown from "./bill_components/SortDropdown";
import VotingCard from "./bill_components/VotingCard";
import { styles as componentStyles } from "./styles";

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
    useState("Most Viewed");
  const [isFiltered, setIsFiltered] = useState(false);
  const [showChamberModal, setShowChamberModal] = useState(false);
  const [selectedChamber, setSelectedChamber] = useState(["Bills"]);

  const [showPartyModal, setShowPartyModal] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState(["Congress"]);

  const [showActionsSort, setShowActionsSort] = useState(false);
  const [selectedActionsSort, setSelectedActionsSort] = useState("Most Recent");

  const [showCosponsorFilter, setShowCosponsorFilter] = useState(false);
  const [showCosponsorSort, setShowCosponsorSort] = useState(false);
  const [selectedCosponsorSort, setSelectedCosponsorSort] = useState("A–Z");
  const [selectedRole, setSelectedRole] = useState<string[]>([]);
  const [showCosponsorChamberModal, setShowCosponsorChamberModal] =
    useState(false);
  const [showCosponsorPartyModal, setShowCosponsorPartyModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>(
    [],
  );

  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  const handleNewListCreate = () => {
    if (newListName.trim()) {
      console.log("New list created:", newListName.trim());
      setNewListName("");
      setShowNewListModal(false);
    }
  };

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
  // const bill = {
  //   id: "HR5124",
  //   avatar: require("../../assets/bills_icons/armedservices.png"),
  //   name: "S.2296 - National Defense Authorization Act for Fiscal Year 2026",
  //   introduced: "04/22/2025",
  //   latest_action: "07/15/2025",
  //   status: "Passed Senate",
  //   committee: "Senate - Armed Services",
  //   sponsor: {
  //     role: "Sen.",
  //     name: "Roger F. Wicker",
  //     party: "R",
  //     district: "MS",
  //   },
  //   type: "US Senate Bill",
  //   summary:
  //     "This bill sets forth policies and authorities for FY2026 for Department of Defense (DOD) programs and activities, military construction, and the national security programs of the Department of Energy (DOE). It also authorizes the Defense Nuclear Facilities Safety Board for FY2026. The bill authorizes appropriations but it does not provide budget authority, which is provided by appropriations legislation.",
  //   amendments: 15,
  //   actions: [], // Actions tab data
  //   cosponsors: [], // Cosponsors tab data
  // };

  const { data, isLoading, error } = useQuery({
    queryKey: ["bill", id],
    queryFn: () => billsService.getById(id as string),
    enabled: !!id,
  });

  console.log("Bill detail data:", data);

  const bill = data?.bill;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error || !bill) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading bill</Text>
      </View>
    );
  }

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

  const voteData = {
    chamberDate: "US Senate - 2/27/25",
    votes: {
      yea: 52,
      yeaDem: 20,
      yeaRep: 31,
      yeaInd: 1,
      nay: 47,
      nayDem: 45,
      nayRep: 1,
      nayInd: 1,
      present: 0,
      presentDem: 0,
      presentRep: 0,
      presentInd: 0,
      notVoting: 1,
      notVotingDem: 1,
      notVotingRep: 1,
      notVotingInd: 1,
      yeaPercent: 50,
      nayPercent: 47,
      presentPercent: 0,
      notVotingPercent: 1,
      voters: [
        {
          name: "Chuck Schumer",
          party: "D",
          role: "Majority Leader, Senator, NY",
          vote: "Nay" as const,
          photo: require("../../assets/officials_images/c_schumer.jpg"),
        },
        {
          name: "Kirsten Gillibrand",
          party: "D",
          role: "Senator, New York",
          vote: "Nay" as const,
          photo: require("../../assets/officials_images/k_gillibrand.webp"),
        },
      ],
    },
  };

  const cosponsors: Cosponsor[] = [
    {
      id: "1",
      name: "Alexandria Ocasio-Cortez",
      party: "D",
      role: "Rep, NY 14th District",
      avatar: require("../../assets/officials_images/aoc.webp"),
      update: "Original cosponsor",
    },
    {
      id: "2",
      name: "John Kennedy",
      party: "R",
      role: "Sen, Louisiana",
      avatar: require("../../assets/officials_images/jKennedy.jpg"),
      update: "Joined 02/10/2025",
    },
    // add more…
  ];

  return (
    <View style={componentStyles.screen}>
      {/* Header Bar */}
      <View style={componentStyles.headerBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <ChevronLeft size={24} color="#535353" />
        </Pressable>
        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => {
              setShowAddModal(true);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Plus size={24} color="#535353" />
          </Pressable>
          <Pressable
            onPress={() => {
              setShowOptionsModal(true);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={componentStyles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Bill Header - ABOVE TABS */}
        <View style={componentStyles.centeredRow}>
          {/* You'll need to add bill icons to assets/bills_icons/ */}
          {/* For now, placeholder circle */}
          <View
            style={[
              componentStyles.avatarBill,
              {
                backgroundColor: "#eee",
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: "#535353" }}
            >
              {bill.type}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.billNumber}>
              {bill.type}.{bill.number} - {bill.title}
            </Text>
            <Text style={componentStyles.billDate}>
              {bill.introducedDate} · Introduced
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={componentStyles.tabsNegative}>
          {/* ... keep your existing tabs code ... */}
        </View>

        {/* Details Tab */}
        {activeTab === "details" && (
          <>
            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Status: </Text>
              <Text style={componentStyles.status}>
                {bill.latestAction?.text || "Introduced"}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Committees: </Text>
              <Text style={componentStyles.detailInfo}>
                {bill.originChamber} - {bill.policyArea?.name || "N/A"}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Sponsor: </Text>
              <Text style={componentStyles.detailInfo}>
                {/* You'll need to fetch sponsor data from bill.sponsors API */}
                Not available from current API
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Type: </Text>
              <Text style={componentStyles.detailInfo}>
                {bill.originChamber === "House"
                  ? "US House Bill"
                  : "US Senate Bill"}
              </Text>
            </View>

            {/* Summary Section */}
            <View style={componentStyles.section}>
              <Text style={componentStyles.detailTitle}>
                {bill.type}.{bill.number} - {bill.title}
              </Text>
              <Text style={componentStyles.summary}>
                {/* Summary needs to be fetched from bill.summaries.url */}
                Summary not available from current API endpoint. The
                Congress.gov API requires an additional call to fetch summaries.
              </Text>
              <Pressable
                onPress={() => {
                  // Open Congress.gov link
                  const url = `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type.toLowerCase()}-bill/${bill.number}`;
                  // You'll need to import Linking from react-native
                  // Linking.openURL(url);
                }}
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
                  marginTop: 12,
                }}
              >
                <Text style={componentStyles.link}>
                  {bill.type}.{bill.number}
                </Text>
              </Pressable>
            </View>

            {/* Amendments Section - Add this */}
            <Pressable
              style={componentStyles.section}
              onPress={() => setShowAmendments(!showAmendments)}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={componentStyles.detailTitle}>Amendments (0)</Text>
                <ChevronDown size={20} color="#7B7C81" />
              </View>
            </Pressable>
          </>
        )}

        {/* Other tabs - simplified for now */}
        {activeTab === "voting" && (
          <View>
            <VotingCard
              chamberDate={voteData.chamberDate}
              votes={voteData.votes}
            />
          </View>
        )}

        {activeTab === "actions" && (
          <ActionHistory
            actions={[
              {
                date: "07/15/25",
                chamber: "Senate",
                description: "Passed Senate",
              },
              {
                date: "05/14/25",
                chamber: "Senate",
                description: "Debated in the Senate after committee changes",
              },
              {
                date: "04/22/25",
                chamber: "Senate",
                description: "Received in the Senate, read the first time.",
              },
            ]}
            selectedSort={selectedActionsSort}
            showSort={showActionsSort}
            setShowSort={setShowActionsSort}
            showChamberModal={showChamberModal}
            showPartyModal={showPartyModal}
            setShowChamberModal={setShowChamberModal}
            setShowPartyModal={setShowPartyModal}
            showOnlyChamber={true}
            chamberLabelOverride="Chamber of Origin"
          />
        )}

        {activeTab === "cosponsors" && (
          <Cosponsors
            cosponsors={cosponsors}
            showCosponsorFilter={showCosponsorFilter}
            setShowCosponsorFilter={setShowCosponsorFilter}
            showCosponsorSort={showCosponsorSort}
            setShowCosponsorSort={setShowCosponsorSort}
            selectedCosponsorSort={selectedCosponsorSort}
            showChamberModal={showChamberModal}
            showPartyModal={showPartyModal}
            setShowChamberModal={setShowChamberModal}
            setShowPartyModal={setShowPartyModal}
            showCosponsorChamberModal={showCosponsorChamberModal}
            showCosponsorPartyModal={showCosponsorPartyModal}
            setShowCosponsorChamberModal={setShowCosponsorChamberModal}
            setShowCosponsorPartyModal={setShowCosponsorPartyModal}
            selectedRole={selectedRole}
            setSelectedRole={setSelectedRole}
            showOnlyChamber={true}
          />
        )}
      </ScrollView>

      <SortDropdown
        showSortDropdown={showAmendmentsSort}
        setShowSortDropdown={setShowAmendmentsSort}
        selectedSort={selectedAmendmentsSort}
        setSelectedSort={setSelectedAmendmentsSort}
        dropdownType="amendments"
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
        showOnlyChamber={activeTab === "actions" || activeTab === "cosponsors"}
        chamberLabelOverride={
          activeTab === "actions" ? "Chamber of Origin" : undefined
        }
        onFilterClose={() => setShowCosponsorFilter(false)}
        // marginTopOverride={0}
      />
      <SortDropdown
        showSortDropdown={showActionsSort}
        setShowSortDropdown={setShowActionsSort}
        selectedSort={selectedActionsSort}
        setSelectedSort={setSelectedActionsSort}
        dropdownType="actions"
      />
      <SortDropdown
        showSortDropdown={showCosponsorSort}
        setShowSortDropdown={setShowCosponsorSort}
        selectedSort={selectedCosponsorSort}
        setSelectedSort={setSelectedCosponsorSort}
        dropdownType="cosponsors"
      />
      {/* Add Modal Popup */}
      <AddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
        onNewListPress={() => setShowNewListModal(true)} // 👈 Add this
      />
      {/* New list name Modal Popup */}
      <NewListNameModal
        visible={showNewListModal}
        onClose={() => {
          setShowNewListModal(false);
          setNewListName("");
        }}
        onConfirm={handleNewListCreate}
        value={newListName}
        onChangeText={setNewListName}
      />
      {/* Options Modal Popup */}
      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
      />
    </View>
  );
}
