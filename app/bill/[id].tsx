import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  Plus,
} from "lucide-react-native";

import { useQuery } from "@tanstack/react-query";
import { decode } from "html-entities";
import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import AddModal from "../global_components/AddModal";
import NewListNameModal from "../global_components/NewListNameModal";
import { billsService } from "../services/bills";
import { billCache } from "../utils/billCache";
import { getBillIcon } from "../utils/billIcons";
import ActionHistory from "./bill_components/ActionHistory";
import Cosponsors, { Cosponsor } from "./bill_components/Cosponsors";
import FilterDropdown from "./bill_components/FilterDropdown";
import OptionsModal from "./bill_components/OptionsModal";
import SortDropdown from "./bill_components/SortDropdown";
import VotingCard from "./bill_components/VotingCard";
import { styles as componentStyles } from "./styles";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { storage } from "../utils/storage";

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
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const handleNewListCreate = async () => {
    if (newListName.trim()) {
      const allLists = await storage.getLists();
      const newList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        items: pendingItemForNewList ? [pendingItemForNewList] : [],
      };

      allLists.push(newList);
      await storage.saveLists(allLists);

      // Track the created list name
      setCreatedListName(newListName.trim());

      // Show progress modal
      setShowNewListProgressModal(true);

      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
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

  const { data, isLoading, error } = useQuery({
    queryKey: ["bill", id],
    queryFn: async () => {
      const billId = id as string;
      const cached = await billCache.getBill(billId);

      if (cached) {
        return { bill: cached };
      }

      // Fetch bill details, summaries, AND actions in parallel
      const [billResult, summariesResult, actionsResult, amendmentsResult] =
        await Promise.all([
          billsService.getById(billId),
          billsService.getSummaries(billId).catch(() => ({ summaries: [] })),
          billsService.getActions(billId).catch(() => ({ actions: [] })),
          billsService.getAmendments(billId).catch(() => ({ amendments: [] })),
        ]);

      console.log("Amendments result:", amendmentsResult);

      // Merge everything into bill data
      const enrichedBill = {
        ...billResult.bill,
        summaries: summariesResult.summaries || [],
        actions: actionsResult.actions || [],
        amendments: amendmentsResult.amendments || [],
      };

      // Save enriched bill to cache
      await billCache.saveBill(billId, enrichedBill);

      // Update stored list items with policyArea
      const lists = await storage.getLists();
      let updated = false;

      for (const list of lists) {
        for (const item of list.items) {
          if (item.id === billId && item.type === "bill") {
            (item as any).policyArea = enrichedBill.policyArea?.name;
            updated = true;
          }
        }
      }

      if (updated) {
        await storage.saveLists(lists);
      }

      return { bill: enrichedBill };
    },
    enabled: !!id,
  });

  const bill = data?.bill;

  const filteredOfficials = useMemo(() => {
    if (!searchQuery.trim()) return mockRelatedOfficials;
    return mockRelatedOfficials.filter((official) =>
      official.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  useEffect(() => {
    if (!showNewListProgressModal) return;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setNewListProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowNewListProgressModal(false);
          setNewListProgress(0);
        }, 300);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [showNewListProgressModal]);

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

  const getBillTypeName = (typeCode: string, chamber: string) => {
    const types: { [key: string]: string } = {
      HR: "House Bill",
      HRES: "House Simple Resolution",
      HJRES: "House Joint Resolution",
      HCONRES: "House Concurrent Resolution",
      S: "Senate Bill",
      SRES: "Senate Simple Resolution",
      SJRES: "Senate Joint Resolution",
      SCONRES: "Senate Concurrent Resolution",
      PN: "Nomination",
      TREATY: "Treaty Document",
    };

    return types[typeCode.toUpperCase()] || `${chamber} Bill`;
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
          onPress={async () => {
            await billCache.clearAll();
            await AsyncStorage.clear();
            alert("Cache cleared! Restart app.");
          }}
          style={{ padding: 10, backgroundColor: "red", margin: 10 }}
        >
          <Text style={{ color: "white" }}>Clear All Cache (Debug)</Text>
        </Pressable>
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
            {bill.policyArea?.name ? (
              <Image
                source={getBillIcon(bill.policyArea.name)}
                style={{ width: "100%", height: "100%", borderRadius: 6 }}
                resizeMode="contain"
              />
            ) : (
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "#535353" }}
              >
                {bill.type}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={componentStyles.billNumber}>
              {bill.type}.{bill.number} - {bill.title}
            </Text>
            <Text style={componentStyles.billDate} numberOfLines={1}>
              {new Date(bill.latestAction.actionDate).toLocaleDateString(
                "en-US",
                {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                },
              )}{" "}
              · {bill.latestAction.text}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={componentStyles.tabsNegative}>
          <View style={componentStyles.tabs}>
            <Pressable
              onPress={() => setActiveTab("details")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "details" && componentStyles.tabActive,
                ]}
              >
                Details
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("voting")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "voting" && componentStyles.tabActive,
                ]}
              >
                Voting
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("actions")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "actions" && componentStyles.tabActive,
                ]}
              >
                Actions
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("cosponsors")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "cosponsors" && componentStyles.tabActive,
                ]}
              >
                Cosponsors
              </Text>
            </Pressable>
          </View>
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
              <Text style={componentStyles.detailTitle}>Latest Action: </Text>
              <Text style={componentStyles.detailInfo}>
                {new Date(bill.latestAction.actionDate).toLocaleDateString(
                  "en-US",
                  {
                    month: "2-digit",
                    day: "2-digit",
                    year: "numeric",
                  },
                )}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Introduced: </Text>
              <Text style={componentStyles.detailInfo}>
                {new Date(bill.introducedDate).toLocaleDateString("en-US", {
                  month: "2-digit",
                  day: "2-digit",
                  year: "numeric",
                })}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Policy Area: </Text>
              <Text style={componentStyles.detailInfo}>
                {bill.policyArea?.name || "N/A"}
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Sponsor: </Text>
              <Text style={componentStyles.detailInfo}>
                Not available from current API
              </Text>
            </View>

            <View style={componentStyles.details}>
              <Text style={componentStyles.detailTitle}>Type: </Text>
              <Text style={componentStyles.detailInfo}>
                {getBillTypeName(bill.type, bill.originChamber)}
              </Text>
            </View>

            {/* Summary Section */}
            <View style={componentStyles.section}>
              <Text style={componentStyles.detailTitle}>Summary</Text>
              {bill.summaries && bill.summaries.length > 0 ? (
                <>
                  <Text style={componentStyles.summary}>
                    {decode(bill.summaries[0].text.replace(/<[^>]*>/g, ""))}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: "#7B7C81", marginTop: 8 }}
                  >
                    {bill.summaries[0].actionDesc} • Last updated:{" "}
                    {new Date(
                      bill.summaries[0].updateDate,
                    ).toLocaleDateString()}
                  </Text>
                </>
              ) : (
                <Text style={componentStyles.summary}>
                  No summary available yet. This bill may be too new or Congress
                  hasn't published a summary. Check back later or view the full
                  text on Congress.gov.
                </Text>
              )}

              <Pressable
                onPress={() => {
                  const url = `https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type.toLowerCase()}-bill/${bill.number}`;
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
                <Text style={componentStyles.link}>View on Congress.gov</Text>
              </Pressable>
            </View>

            {/* Amendments Section */}
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
                <Text style={componentStyles.detailTitle}>
                  Amendments ({bill.amendments?.length || 0})
                </Text>
                {showAmendments ? (
                  <ChevronUp size={20} color="#7B7C81" />
                ) : (
                  <ChevronDown size={20} color="#7B7C81" />
                )}
              </View>
            </Pressable>

            {/* Show amendments when expanded */}
            {showAmendments &&
              bill.amendments &&
              bill.amendments.length > 0 && (
                <View style={componentStyles.section}>
                  {bill.amendments.map((amendment: any, index: number) => (
                    <View
                      key={index}
                      style={{
                        marginBottom: 16,
                        paddingBottom: 16,
                        borderBottomWidth:
                          index < bill.amendments.length - 1 ? 1 : 0,
                        borderBottomColor: "#e0e0e0",
                      }}
                    >
                      <Text
                        style={[
                          componentStyles.detailTitle,
                          { marginBottom: 4 },
                        ]}
                      >
                        {amendment.number}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#7B7C81",
                          marginBottom: 8,
                        }}
                      >
                        {amendment.type} •{" "}
                        {new Date(
                          amendment.latestAction?.actionDate ||
                            amendment.updateDate,
                        ).toLocaleDateString()}
                      </Text>
                      <Text style={componentStyles.summary}>
                        {amendment.description ||
                          amendment.purpose ||
                          amendment.latestAction?.text ||
                          "No description available"}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
          </>
        )}

        {/* Voting Tab */}
        {activeTab === "voting" && (
          <View>
            <VotingCard
              chamberDate={voteData.chamberDate}
              votes={voteData.votes}
            />
          </View>
        )}

        {/* Actions Tab */}
        {activeTab === "actions" && (
          <ActionHistory
            actions={
              Array.isArray(bill.actions)
                ? bill.actions
                    // Remove duplicates based on date + text combination
                    .filter((action: any, index: number, arr: any[]) => {
                      const key = `${action.actionDate}-${action.text}`;
                      return (
                        arr.findIndex(
                          (a) => `${a.actionDate}-${a.text}` === key,
                        ) === index
                      );
                    })
                    .map((action: any) => ({
                      date:
                        action.actionDate.split("-").slice(1).join("/") +
                        "/" +
                        action.actionDate.split("-")[0].slice(2),
                      chamber: action.sourceSystem?.name || "",
                      description: action.text,
                    }))
                : []
            }
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

        {/* Cosponsors Tab */}
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
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
        currentItem={
          bill
            ? {
                id: `${bill.type.toLowerCase()}${bill.number}`,
                type: "bill",
                name: `${bill.type}.${bill.number} - ${bill.title}`,
                date: bill.latestAction?.actionDate,
                committee: bill.latestAction?.text,
              }
            : undefined
        }
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
      {/* New List Progress Modal */}
      <Modal
        visible={showNewListProgressModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <Pressable
          style={[componentStyles.modalOverlay, { justifyContent: "center" }]}
          onPress={() => {}}
        >
          <View
            style={{
              backgroundColor: "#f5f5f5",
              marginHorizontal: 16,
              borderRadius: 16,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#1a1a1a",
                marginTop: 8,
                marginBottom: 32,
                textAlign: "center",
              }}
            >
              Creating {newListName || "new list"}...
            </Text>

            {/* Progress Bar */}
            <View
              style={{
                width: "100%",
                height: 6,
                backgroundColor: "#e0e0e0",
                borderRadius: 3,
                marginBottom: 12,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: `${newListProgress}%`,
                  height: "100%",
                  backgroundColor: "#00AFFF",
                  borderRadius: 3,
                }}
              />
            </View>

            {/* Progress Text */}
            <Text
              style={{
                fontSize: 12,
                color: "#7B7C81",
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {Math.round(newListProgress)}%
            </Text>

            {/* Cancel Button - ADD THIS */}
            <Pressable
              onPress={async () => {
                // Delete the newly created list
                const allLists = await storage.getLists();
                const newlyCreatedList = allLists.find(
                  (l) => l.name === createdListName,
                );

                if (newlyCreatedList) {
                  await storage.deleteList(newlyCreatedList.id);
                }

                // Close modal and reset
                setShowNewListProgressModal(false);
                setNewListProgress(0);
                setCreatedListName("");
              }}
              style={({ pressed }) => ({
                transform: pressed ? [{ scale: 0.96 }] : [],
              })}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: "#535353",
                  textAlign: "center",
                }}
              >
                Cancel
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
