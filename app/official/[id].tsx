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
import NewListNameModal from "../global_components/NewListNameModal";
import { officialsService } from "../services/officials";
import FilterDropdown from "./official_components/FilterDropdown";
import OptionsModal from "./official_components/OptionsModal";
import SearchModal from "./official_components/SearchModal";
import SortDropdown from "./official_components/SortDropdown";
import { styles as componentStyles } from "./styles";

import { storage } from "../utils/storage";

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

export default function OfficialDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router: Router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "legislation">(
    "profile",
  );
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
        items: pendingItemForNewList ? [pendingItemForNewList] : [], // Add the item!
      };

      allLists.push(newList);
      await storage.saveLists(allLists);

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

  const { data, isLoading, error } = useQuery({
    queryKey: ["official", id],
    queryFn: () => officialsService.getById(id as string),
    enabled: !!id,
  });

  const official = data?.member;

  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return mockBills;
    return mockBills.filter(
      (bill) =>
        bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.committee.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
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
        {/* Official Header - ABOVE TABS */}
        <View style={componentStyles.header}>
          <Text style={componentStyles.roleTop}>
            {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
            {official.district
              ? ` Representative, ${official.state} - District ${official.district}`
              : ` Senator, ${official.state}`}
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
                          ? "#FFE627"
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
              onPress={() => setActiveTab("legislation")}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={[
                  componentStyles.tab,
                  activeTab === "legislation" && componentStyles.tabActive,
                ]}
              >
                Legislation
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
                <Text style={componentStyles.sectionTitle}>Congress</Text>
                <Text style={componentStyles.sectionTitle}>
                  (2019 - Present)
                </Text>
              </View>
              <View style={componentStyles.termRow}>
                <Text style={componentStyles.term}>
                  {official.partyHistory?.[0]?.partyName?.charAt(0) || ""} ·{" "}
                  {official.district
                    ? ` Representative, ${official.state} - District ${official.district}`
                    : " Senator"}
                </Text>
              </View>
            </View>

            {/* Map */}
            <View style={componentStyles.map}>
              <Text style={{ padding: 20, color: "#7B7C81" }}>
                District map not available from API
              </Text>
            </View>
          </>
        ) : (
          <View>
            {/* Legislation Tab */}
            <View style={componentStyles.legislationHeader}>
              <View style={componentStyles.legislationHeaderLeft}>
                <Pressable
                  style={({ pressed }) => [
                    componentStyles.button,
                    {
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                  onPress={() => {
                    setShowTypeModal(true);
                    setShowPolicyModal(true);
                  }}
                >
                  <Text style={componentStyles.legislationHeaderTotal}>
                    {isFiltered ? "Filtered" : "Total"} Legislation 3,353
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
                    {
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                  onPress={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <Text style={componentStyles.sortText}>{selectedSort}</Text>
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
                  {
                    transform: [{ scale: pressed ? 0.75 : 1 }],
                  },
                ]}
                onPress={() => setShowSearchModal(true)}
              >
                <Search size={24} color="#535353" />
              </Pressable>
            </View>

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
          name: official.name,
          party: official.partyName?.charAt(0) || "",
          role: official.district
            ? `Representative, ${official.state} - District ${official.district}`
            : `Senator, ${official.state}`,
          photoUrl: (official as any).depiction?.imageUrl,
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
              style={{ fontSize: 12, color: "#7B7C81", textAlign: "center" }}
            >
              {Math.round(newListProgress)}%
            </Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
