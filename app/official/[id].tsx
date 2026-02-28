import { useLocalSearchParams, useRouter, type Router } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useQuery } from "@tanstack/react-query";
import AddModal from "../global_components/AddModal";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import { officialsService } from "../services/officials";
import { storage } from "../utils/storage";
import FilterDropdown from "./official_components/FilterDropdown";
import OptionsModal from "./official_components/OptionsModal";
import SearchModal from "./official_components/SearchModal";
import SortDropdown from "./official_components/SortDropdown";
import { styles as componentStyles } from "./styles";

function BillCard({ item }: { item: any }) {
  return (
    <View style={componentStyles.billCard}>
      <Image source={item.icon} style={componentStyles.billIcon} />
      <View style={componentStyles.billInfo}>
        <Text style={componentStyles.billNumber}>{item.name}</Text>
        <View style={componentStyles.billStatusRow}>
          <Text style={componentStyles.billTitle}>{item.date}</Text>
          <Text style={componentStyles.separator}>·</Text>
          <Text style={componentStyles.billTitle}>{item.committee}</Text>
          <Text style={componentStyles.separator}>·</Text>
          <Text style={componentStyles.update}>{item.update}</Text>
        </View>
      </View>
    </View>
  );
}

// Renders a real bill from the API using existing BillCard styles
function LegislationCard({ item }: { item: any }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  return (
    <View style={componentStyles.billCard}>
      <View style={componentStyles.billInfo}>
        <Text style={componentStyles.billNumber}>
          {item.type}.{item.number}
        </Text>
        <Text style={componentStyles.billTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={componentStyles.billStatusRow}>
          <Text style={componentStyles.billTitle}>
            {formatDate(item.introducedDate)}
          </Text>
          {item.policyArea?.name && (
            <>
              <Text style={componentStyles.separator}>·</Text>
              <Text style={componentStyles.billTitle} numberOfLines={1}>
                {item.policyArea.name}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

export default function OfficialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router: Router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "profile" | "sponsor" | "cosponsor"
  >("profile");

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState("Most Viewed");

  const [isFiltered, setIsFiltered] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(["Bills"]);

  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicies, setSelectedPolicies] = useState(["Congress"]);

  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [id]);

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

  const legislationTypes: FilterOption[] = [
    { id: "all", label: "All" },
    { id: "house_bill", label: "House Bills" },
    { id: "senate_bill", label: "Senate Bills" },
    { id: "house_amdt", label: "House Amendment" },
    { id: "senate_amdt", label: "Senate Amendment" },
    { id: "house_joint_resolution", label: "House Joint Resolution" },
    { id: "senate_joint_resolution", label: "Senate Joint Resolution" },
    { id: "house_con_res", label: "House Concurrent Resolution" },
    { id: "senate_con_res", label: "Senate Concurrent Resolution" },
    { id: "house_res", label: "House Resolution" },
    { id: "senate_res", label: "Senate Resolution" },
    { id: "nominations", label: "Nominations" },
    { id: "treaty_doc", label: "Treaty Document" },
  ];

  const policyAreas: FilterOption[] = [
    { id: "all", label: "All " },
    { id: "congress", label: "Congress" },
    { id: "health", label: "Health" },
    { id: "gov_operations", label: "Gov Operations and Politics" },
    { id: "armed_forces", label: "Armed Forces and National Security" },
    { id: "intl_affairs", label: "International Affairs" },
    { id: "taxation", label: "Taxation" },
    { id: "crime_law_enf", label: "Crime and Law Enforcement" },
    { id: "public_lands_nat_res", label: "Public Lands and Natural Resources" },
    { id: "agriculture_food", label: "Agriculture and Food" },
    { id: "transportation", label: "Transportation and Public Works" },
    { id: "education", label: "Education" },
    { id: "finance", label: "Finance and Financial Sector" },
    { id: "immigration", label: "Immigration" },
    { id: "science_tech", label: "Science, Technology, Communications" },
    { id: "env_prot", label: "Environmental Protection" },
    { id: "commerce", label: "Commerce" },
    { id: "energy", label: "Energy" },
    { id: "labor_employment", label: "Labor and Employment" },
    { id: "foreign_trade", label: "Foreign Trade and International Finance" },
    { id: "housing", label: "Housing and Community Development" },
    { id: "native_americans", label: "Native Americans" },
    { id: "energy_man", label: "Energy Management" },
    {
      id: "civil_rights",
      label: "Civil Rights and Liberties, Minority Issues",
    },
    { id: "econ", label: "Economics and Public Finance" },
    { id: "law", label: "Law" },
    { id: "social_welfare", label: "Social Welfare" },
    { id: "sports_rec", label: "Sports and Recreation" },
    { id: "arts", label: "Arts, Culture, and Religion" },
    { id: "families", label: "Families" },
    { id: "water", label: "Water Resources Development" },
    { id: "animals", label: "Animals" },
  ];

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const togglePolicy = (policy: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policy)
        ? prev.filter((p) => p !== policy)
        : [...prev, policy],
    );
  };

  const handleCancel = () => {
    setSelectedTypes(["Bills"]);
    setSelectedPolicies(["Congress"]);
    setShowTypeModal(false);
    setShowPolicyModal(false);
  };

  const handleApply = () => {
    const hasFilters = selectedTypes.length > 1 || selectedPolicies.length > 1;
    setIsFiltered(hasFilters);
    setShowTypeModal(false);
    setShowPolicyModal(false);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["official", id],
    queryFn: () => officialsService.getById(id as string),
    enabled: !!id,
  });

  const { data: sponsoredData, isLoading: sponsoredLoading } = useQuery({
    queryKey: ["officialSponsored", id],
    queryFn: () => officialsService.getSponsored(id as string),
    enabled: !!id && (activeTab === "sponsor" || activeTab === "cosponsor"),
    retry: 1,
  });

  const { data: cosponsoredData, isLoading: cosponsoredLoading } = useQuery({
    queryKey: ["officialCosponsored", id],
    queryFn: () => officialsService.getCosponsored(id as string),
    enabled: !!id && (activeTab === "sponsor" || activeTab === "cosponsor"),
    retry: 1,
  });

  const official = data?.member;

  // Filter amendments out and expose the active list/count/loading for current toggle
  const sponsoredBills = useMemo(
    () =>
      (sponsoredData?.legislation ?? []).filter(
        (item: any) => !item.amendmentNumber && item.type,
      ),
    [sponsoredData],
  );

  const cosponsoredBills = useMemo(
    () =>
      (cosponsoredData?.legislation ?? []).filter(
        (item: any) => !item.amendmentNumber && item.type,
      ),
    [cosponsoredData],
  );

  const activeBills =
    activeTab === "sponsor" ? sponsoredBills : cosponsoredBills;
  const activeCount =
    activeTab === "sponsor"
      ? (sponsoredData?.count ?? 0)
      : (cosponsoredData?.count ?? 0);
  const activeLoading =
    activeTab === "sponsor" ? sponsoredLoading : cosponsoredLoading;

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
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          Loading official...
        </Text>
      </View>
    );
  }

  if (error || !official) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Error loading official</Text>
      </View>
    );
  }
  console.log(official);
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
            onPress={() => setShowAddModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Plus size={24} color="#535353" />
          </Pressable>
          <Pressable
            onPress={() => setShowOptionsModal(true)}
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
        {/* Official Header - ABOVE TABS */}
        <View style={componentStyles.header}>
          <Text style={componentStyles.roleTop}>
            {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
            {official.terms?.[0]?.chamber === "House of Representatives"
              ? `Representative, ${official.state}${official.terms?.[0]?.district ? ` - District ${official.terms[0].district}` : ""}`
              : `Senator, ${official.state}`}
          </Text>
          <View style={componentStyles.centeredRow}>
            <View
              style={[
                componentStyles.avatar,
                {
                  borderColor:
                    official.partyHistory?.[0]?.partyName === "Republican"
                      ? "#D45252"
                      : official.partyHistory?.[0]?.partyName === "Democratic"
                        ? "#008CFF"
                        : official.partyHistory?.[0]?.partyName ===
                            "Independent"
                          ? "#FAEA70"
                          : "#008CFF", // default
                },
              ]}
            >
              {official.depiction?.imageUrl && !imageError ? (
                <Image
                  source={{ uri: official.depiction.imageUrl }}
                  style={{
                    width: "100%",
                    height: "120%",
                  }}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#BFBFBF",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {official.lastName?.charAt(0) || "?"}
                  </Text>
                </View>
              )}
            </View>
            <Text style={componentStyles.name}>{official.directOrderName}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={componentStyles.tabsNegative}>
          <View style={componentStyles.tabs}>
            <Pressable
              onPress={() => setActiveTab("profile")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "profile" && componentStyles.tabActive,
                ]}
              >
                Profile
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("sponsor")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "sponsor" && componentStyles.tabActive,
                ]}
              >
                Sponsor
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setActiveTab("cosponsor")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "cosponsor" && componentStyles.tabActive,
                ]}
              >
                Cosponsor
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Tab Content */}
        {activeTab === "profile" ? (
          <>
            {/* Bio placeholder */}
            <View>
              <Text style={componentStyles.bio}>
                Bio not available from Congress.gov API
              </Text>
              <Text style={componentStyles.website}>
                {official.officialWebsiteUrl || "No website available"}
              </Text>
            </View>

            {/* Congress History */}
            <View style={componentStyles.section}>
              <View style={componentStyles.termRow}>
                <Text style={componentStyles.sectionTitle}>
                  Congressional History
                </Text>
              </View>
              {official.terms && official.terms.length > 0 ? (
                [...official.terms]
                  .sort((a: any, b: any) => b.startYear - a.startYear)
                  .map((term: any, index: number) => (
                    <View key={index} style={componentStyles.termRow}>
                      <Text
                        style={[componentStyles.term, { flex: 1 }]}
                        numberOfLines={1}
                      >
                        {term.chamber === "Senate"
                          ? "Senator"
                          : "Representative"}
                        , {official.state}
                        {term.district ? ` - District ${term.district}` : ""}
                      </Text>
                      <Text
                        style={[
                          componentStyles.term,
                          { flex: 0, textAlign: "right" },
                        ]}
                      >
                        {term.startYear}
                        {term.endYear ? ` – ${term.endYear}` : " – Present"}
                      </Text>
                    </View>
                  ))
              ) : (
                <View style={componentStyles.termRow}>
                  <Text style={componentStyles.term}>
                    {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
                    {official.terms?.[0]?.chamber === "House of Representatives"
                      ? `Representative, ${official.state}${official.terms?.[0]?.district ? ` - District ${official.terms[0].district}` : ""}`
                      : `Senator, ${official.state}`}
                  </Text>
                </View>
              )}
            </View>

            {/* Map */}
            <View style={componentStyles.map}>
              <Text style={{ padding: 20, color: "#7B7C81" }}>
                District map not available from API
              </Text>
            </View>
          </>
        ) : (
          <View style={{ marginBottom: 96 }}>
            {activeLoading ? (
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  paddingVertical: 60,
                }}
              >
                <LoadingSpinner />
                <Text style={{ color: "#7B7C81", marginTop: 16, fontSize: 13 }}>
                  Loading legislation...
                </Text>
              </View>
            ) : (
              <>
                {/* Sponsor / Cosponsor Tab */}
                <View style={componentStyles.legislationHeader}>
                  <View style={componentStyles.legislationHeaderLeft}>
                    <Pressable
                      style={({ pressed }) => [
                        componentStyles.button,
                        { transform: [{ scale: pressed ? 0.96 : 1 }] },
                      ]}
                      onPress={() => {
                        setShowTypeModal(true);
                        setShowPolicyModal(true);
                      }}
                    >
                      <Text style={componentStyles.legislationHeaderTotal}>
                        {activeBills.length < activeCount
                          ? `${activeBills.length} / ${activeCount.toLocaleString()} Shown`
                          : ""}
                      </Text>
                      {showTypeModal || showPolicyModal ? (
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

                    {/* Sort by Dropdown */}
                    <Pressable
                      style={({ pressed }) => [
                        componentStyles.button,
                        { transform: [{ scale: pressed ? 0.96 : 1 }] },
                      ]}
                      onPress={() => setShowSortDropdown(!showSortDropdown)}
                    >
                      <Text style={componentStyles.sortText}>
                        {selectedSort}
                      </Text>
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

                  {/* Search Button */}
                  <Pressable
                    style={({ pressed }) => [
                      componentStyles.button,
                      { transform: [{ scale: pressed ? 0.75 : 1 }] },
                    ]}
                    onPress={() => setShowSearchModal(true)}
                  >
                    <Search size={24} color="#535353" />
                  </Pressable>
                </View>

                {/* Bill list */}
                {activeBills.length === 0 ? (
                  <View style={{ paddingVertical: 60, alignItems: "center" }}>
                    <Text style={{ color: "#7B7C81", fontSize: 13 }}>
                      No legislation found
                    </Text>
                  </View>
                ) : (
                  activeBills.map((item: any, index: number) => (
                    <LegislationCard
                      key={`${item.type}-${item.number}-${item.congress}-${index}`}
                      item={item}
                    />
                  ))
                )}

                {/* Search Modal Popup */}
                <SearchModal
                  isVisible={showSearchModal}
                  onClose={() => setShowSearchModal(false)}
                  onSearch={setSearchQuery}
                />

                {/* Sort by Modal Popup */}
                <SortDropdown
                  showSortDropdown={showSortDropdown}
                  setShowSortDropdown={setShowSortDropdown}
                  selectedSort={selectedSort}
                  setSelectedSort={setSelectedSort}
                />

                {/* Selected Legislation Dropdown Popup */}
                <FilterDropdown
                  showTypeModal={showTypeModal}
                  showPolicyModal={showPolicyModal}
                  selectedTypes={selectedTypes}
                  selectedPolicies={selectedPolicies}
                  toggleType={toggleType}
                  togglePolicy={togglePolicy}
                  setShowTypeModal={setShowTypeModal}
                  setShowPolicyModal={setShowPolicyModal}
                  onCancel={handleCancel}
                  onApply={handleApply}
                  legislationTypes={legislationTypes}
                  policyAreas={policyAreas}
                />
              </>
            )}
          </View>
        )}
      </ScrollView>

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
        currentItem={{
          id: official.bioguideId,
          type: "official",
          name: official.directOrderName,
          party: official.partyHistory?.[0]?.partyName?.charAt(0) || "",
          role:
            official.chamber === "House of Representatives"
              ? `Representative, ${official.state}${official.district ? ` - District ${official.district}` : ""}`
              : `Senator, ${official.state}`,
          photoUrl: official.depiction?.imageUrl,
        }}
      />

      {/* Options Modal Popup */}
      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
      />

      {/* New List Name Modal Popup */}
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

            {/* Cancel Button */}
            <Pressable
              onPress={async () => {
                const allLists = await storage.getLists();
                const newlyCreatedList = allLists.find(
                  (l) => l.name === createdListName,
                );

                if (newlyCreatedList) {
                  await storage.deleteList(newlyCreatedList.id);
                }

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
