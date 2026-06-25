import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Plus,
  Search,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useTour } from "../context/TourContext";
import AddModal from "../global_components/AddModal";
import ErrorScreen from "../global_components/ErrorScreen";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import OfficialsOptionsModal from "../global_components/OfficialsOptionsModal";
import ReportErrorModal from "../global_components/ReportErrorModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import { officialsService } from "../services/officials";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { notificationPreferences } from "../utils/notificationPreferences";
import { storage } from "../utils/storage";

type Official = {
  id: string;
  name: string;
  party: string;
  role: string;
  update?: string;
  avatar?: any;
  chamber?: string;
  district?: number;
  state?: string;
  bioguideId?: string;
};
const LOCATION_OPTIONS = [
  "All States",
  "Alabama",
  "Alaska",
  "American Samoa",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Guam",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Northern Mariana Islands",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "U.S. Virgin Islands",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];
export default function OfficialsScreen() {
  const stateDropdownRef = useRef<View>(null);
  const firstCardPlusRef = useRef<View>(null);

  const { isActive, currentStep, setTargetLayout } = useTour();
  // console.log("Official Screen render:", Date.now());
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchInstantOpen, setSearchInstantOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchNavigatedAwayRef = useRef(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] =
    useState("New York");
  const [showListSelection, setShowListSelection] = useState(false);
  const [selectedList, setSelectedList] = useState("All States");

  // New List Modal
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [pendingItemForNewList, setPendingItemForNewList] = useState<any>(null);
  const [showNewListProgressModal, setShowNewListProgressModal] =
    useState(false);
  const [newListProgress, setNewListProgress] = useState(0);
  const [createdListName, setCreatedListName] = useState("");

  const [priorityState, setPriorityStateLocal] = useState<string | null>(null);

  const [showActionToast, setShowActionToast] = useState(false);
  const [actionToastMessage, setActionToastMessage] = useState("");

  const [showReportModal, setShowReportModal] = useState(false);
  const handleReportError = () => setShowReportModal(true);

  const handleNewListCreate = async (listName?: string) => {
    const name = listName ?? newListName;
    if (name.trim()) {
      const allLists = await storage.getLists();

      const itemToSave = pendingItemForNewList
        ? {
            id: pendingItemForNewList.id ?? pendingItemForNewList.bioguideId,
            type: (pendingItemForNewList.type === "official" ||
            pendingItemForNewList.bioguideId ||
            pendingItemForNewList.depiction
              ? "official"
              : "bill") as "official" | "bill",
            name: pendingItemForNewList.name,
            party:
              pendingItemForNewList.party ??
              pendingItemForNewList.partyName?.charAt(0),
            role:
              pendingItemForNewList.role ??
              (pendingItemForNewList.chamber === "House of Representatives" ||
              pendingItemForNewList.chamber === "House" ||
              TERRITORY_STATES.has(pendingItemForNewList.state) ||
              pendingItemForNewList.district != null
                ? `Representative, ${pendingItemForNewList.state}${pendingItemForNewList.district ? `, District ${pendingItemForNewList.district}` : ""}`
                : `Senator, ${pendingItemForNewList.state}`),
            date: pendingItemForNewList.date,
            latestAction:
              typeof pendingItemForNewList.latestAction === "string"
                ? pendingItemForNewList.latestAction
                : pendingItemForNewList.latestAction?.text,
            policyArea:
              pendingItemForNewList.policyArea?.name ??
              pendingItemForNewList.policyArea,
            photoUrl:
              pendingItemForNewList.photoUrl ??
              pendingItemForNewList.depiction?.imageUrl,
            update: "",
          }
        : null;

      const newList = {
        id: Date.now().toString(),
        name: name.trim(),
        items: itemToSave ? [itemToSave] : [],
      };

      allLists.push(newList);
      await storage.saveLists(allLists);
      listEvents.emit(LIST_UPDATED);
      setCreatedListName(name.trim());
      setShowNewListProgressModal(true);
      setTimeout(() => showToast(`Added to ${name.trim()}`), 1000);
      setNewListName("");
      setShowNewListModal(false);
      setPendingItemForNewList(null);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const [currentOfficialId, setCurrentOfficialId] = useState<string | null>(
    null,
  );
  const [listsVersion, setListsVersion] = useState(0);
  const [notifVersion, setNotifVersion] = useState(0);
  const [enabledStateNotifs, setEnabledStateNotifs] = useState<Set<string>>(
    new Set(
      LOCATION_OPTIONS.filter((s) =>
        notificationPreferences.isEnabled(`state_${s}`),
      ),
    ),
  );

  const showToast = (message: string) => {
    setActionToastMessage(message);
    setShowActionToast(true);
    setTimeout(() => setShowActionToast(false), 1500);
  };

  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["officials"],
    queryFn: officialsService.getAll,
  });

  const allOfficials = data?.officials || [];

  // Filter officials based on selected state
  const officials = useMemo(() => {
    const filtered =
      selectedList === "All States"
        ? allOfficials
        : allOfficials.filter((official) => {
            const normalizedState =
              official.state === "Virgin Islands"
                ? "U.S. Virgin Islands"
                : official.state;
            return normalizedState === selectedList;
          });
    return [...filtered].sort((a: any, b: any) => {
      // Sort by state alphabetically
      if (a.state < b.state) return -1;
      if (a.state > b.state) return 1;

      // Within same state: senators first
      const aIsSenator = a.chamber !== "House of Representatives";
      const bIsSenator = b.chamber !== "House of Representatives";
      if (aIsSenator && !bIsSenator) return -1;
      if (!aIsSenator && bIsSenator) return 1;

      // Both reps: sort by district number
      return (a.district ?? 0) - (b.district ?? 0);
    });
  }, [allOfficials, selectedList]);

  const currentOfficial = allOfficials.find(
    (o) => o.bioguideId === currentOfficialId,
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.push("/(tabs)/home" as any);
        return true;
      },
    );
    return () => subscription.remove();
  }, []);

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

  useEffect(() => {
    const handler = () => setListsVersion((v) => v + 1);
    listEvents.on(LIST_UPDATED, handler);
    return () => {
      listEvents.removeListener(LIST_UPDATED, handler);
    };
  }, []);

  useEffect(() => {
    const saved = storage.getPriorityState();
    if (saved) {
      setPriorityStateLocal(saved);
      setSelectedList(saved); // default to priority state
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!isActive) return;
      if (currentStep === 3) {
        setTimeout(() => {
          stateDropdownRef.current?.measureInWindow((x, y, width, height) => {
            if (width > 0) setTargetLayout({ x, y, width, height });
          });
        }, 500);
      }
      if (currentStep === 4) {
        setTimeout(() => {
          firstCardPlusRef.current?.measureInWindow((x, y, width, height) => {
            if (width > 0) setTargetLayout({ x, y, width, height });
          });
        }, 500);
      }
    }, [isActive, currentStep]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (searchNavigatedAwayRef.current && searchQuery) {
        searchNavigatedAwayRef.current = false;
        setSearchInstantOpen(true);
        setShowSearchModal(true);
      }
    }, [searchQuery]),
  );

  useEffect(() => {
    if (!isActive) return;
    if (isLoading) return;
    if (currentStep === 3) {
      setTimeout(() => {
        stateDropdownRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
    if (currentStep === 4) {
      setTimeout(() => {
        firstCardPlusRef.current?.measureInWindow((x, y, width, height) => {
          if (width > 0) setTargetLayout({ x, y, width, height });
        });
      }, 300);
    }
  }, [isLoading, isActive, currentStep]);

  const handleSetPriority = () => {
    if (selectedList === "All States") return;
    storage.setPriorityState(selectedList);
    setPriorityStateLocal(selectedList);
    notificationPreferences.enable(`state_${selectedList}`, "official");
    setEnabledStateNotifs(
      new Set(
        LOCATION_OPTIONS.filter((s) =>
          notificationPreferences.isEnabled(`state_${s}`),
        ),
      ),
    );
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          Loading officials...
        </Text>
      </View>
    );
  }

  if (error) {
    return <ErrorScreen onRetry={refetch} />;
  }

  return (
    <View style={componentStyles.container}>
      <View style={componentStyles.headerBar}>
        <View style={componentStyles.headerLeft}>
          <View ref={stateDropdownRef} collapsable={false}>
            <Pressable
              onPress={() => setShowListSelection(!showListSelection)}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text
                  style={[
                    componentStyles.header,
                    { alignItems: "center", maxWidth: 220 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {selectedList}
                </Text>
                {showListSelection ? (
                  <ChevronUp
                    size={24}
                    color="#535353"
                    style={{ marginBottom: 12 }}
                  />
                ) : (
                  <ChevronDown
                    size={24}
                    color="#535353"
                    style={{ marginBottom: 12 }}
                  />
                )}
              </View>
            </Pressable>
          </View>
        </View>

        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => setShowSearchModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Search size={24} color="#535353" />
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

      <FlatList
        data={officials}
        keyExtractor={(item) => item.bioguideId}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item, index }) => (
          <OfficialCard
            item={item}
            onAddPress={(id) => {
              setCurrentOfficialId(id);
              setShowAddModal(true);
            }}
            plusRef={index === 0 ? firstCardPlusRef : undefined}
          />
        )}
        directionalLockEnabled={true}
      />

      {/* Add Modal */}
      <AddModal
        listsVersion={listsVersion}
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
        currentItem={(() => {
          const official = allOfficials.find(
            (o) => o.bioguideId === currentOfficialId,
          );
          if (!official) return undefined;
          return {
            id: official.bioguideId,
            type: "official" as const,
            name: official.name,
            party: official.partyName?.charAt(0) || "",
            role:
              official.chamber === "House of Representatives" ||
              official.chamber === "House" ||
              TERRITORY_STATES.has(official.state) ||
              official.district != null
                ? `Representative, ${official.state}${official.district ? `, District ${official.district}` : ""}`
                : `Senator, ${official.state}`,
            photoUrl: (official as any).depiction?.imageUrl || undefined,
          };
        })()}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        skipEntryAnimation={searchInstantOpen}
        onClose={() => { setSearchInstantOpen(false); setShowSearchModal(false); }}
        onNavigatingAway={() => {
          searchNavigatedAwayRef.current = true;
          setShowSearchModal(false);
        }}
        onSearch={setSearchQuery}
        searchContext={selectedList}
        items={officials}
        onItemPress={(item) => {
          router.navigate(`/official/${item.bioguideId}`);
        }}
        onNewListPress={(item) => {
          setPendingItemForNewList(item);
          setShowNewListModal(true);
        }}
      />

      {/* Official Options Modal */}
      <OfficialsOptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        onSetPriority={handleSetPriority}
        onReportError={handleReportError}
        selectedState={selectedList}
        onNotifVersionChange={() => {
          setNotifVersion((v) => v + 1);
          setEnabledStateNotifs(
            new Set(
              LOCATION_OPTIONS.filter((s) =>
                notificationPreferences.isEnabled(`state_${s}`),
              ),
            ),
          );
        }}
      />

      <ReportErrorModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        screen="officials" // change to "legislation" or "home" per file
      />

      {/* Location Selection Dropdown */}
      <Modal
        visible={showListSelection}
        transparent
        animationType="fade"
        onRequestClose={() => setShowListSelection(false)}
        statusBarTranslucent
      >
        <Pressable
          style={[componentStyles.modalOverlay, { justifyContent: "center" }]}
          onPress={() => setShowListSelection(false)}
        >
          <ScrollView
            style={[componentStyles.dropdown, { marginVertical: 96 }]}
          >
            {[
              ...(priorityState && priorityState !== "All States"
                ? [priorityState]
                : []),
              ...LOCATION_OPTIONS.filter((o) => o !== priorityState),
            ].map((option) => {
              const stateNotifEnabled =
                option !== "All States" && enabledStateNotifs.has(option);
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) =>
                    pressed
                      ? componentStyles.dropdownItemPressed
                      : componentStyles.dropdownItem
                  }
                  onPress={() => {
                    setSelectedList(option);
                    setShowListSelection(false);
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Text
                        style={[
                          componentStyles.dropdownItemText,
                          selectedList === option && { fontWeight: "600" },
                        ]}
                      >
                        {option}
                        {option === priorityState ? " (Priority State)" : ""}
                      </Text>
                      {stateNotifEnabled && (
                        <Bell
                          size={14}
                          style={{ marginTop: 4 }}
                          color="#008CFF"
                        />
                      )}
                    </View>
                    {selectedList === option && (
                      <Check size={20} color="#008CFF" strokeWidth={4} />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Modal>

      {/* New List Name Modal */}
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
              Creating and adding to {createdListName || "new list"}...
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
      {showActionToast && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <View
            style={{
              backgroundColor: "#535353",
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: "#fff", fontWeight: "500" }}>
              {actionToastMessage}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const STATE_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  "American Samoa": "AS",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  "District of Columbia": "DC",
  Florida: "FL",
  Georgia: "GA",
  Guam: "GU",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Northern Mariana Islands": "MP",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Puerto Rico": "PR",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  "U.S. Virgin Islands": "VI",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

// US territories have delegates/resident commissioners (House members), never senators
const TERRITORY_STATES = new Set(["GU", "VI", "AS", "MP", "PR", "DC"]);

function formatRole(
  chamber: string,
  state: string,
  district?: number | null,
  screenWidth?: number,
): string {
  const baseThreshold = Platform.OS === "ios" ? 32 : 39;
  const threshold =
    screenWidth && screenWidth < 390 ? baseThreshold - 6 : baseThreshold;

  const stateAbbr = STATE_ABBR[state] ?? state;

  const isHouse =
    chamber === "House of Representatives" ||
    chamber === "House" ||
    TERRITORY_STATES.has(state) ||
    (!chamber?.toLowerCase().includes("senate") && district != null);

  if (isHouse) {
    const full = `Representative, ${state}${district ? `, District ${district}` : ""}`;
    const abbr = `Rep, ${state}${district ? `, District ${district}` : ""}`;
    const short = `Rep, ${stateAbbr}${district ? `, District ${district}` : ""}`;
    if (full.length <= threshold) return full;
    if (abbr.length <= threshold) return abbr;
    return short;
  }

  const full = `Senator, ${state}`;
  const abbr = `Sen, ${state}`;
  const short = `Sen, ${stateAbbr}`;
  if (full.length <= threshold + 1) return full;
  if (abbr.length <= threshold + 1) return abbr;
  return short;
}

const OfficialCard = React.memo(function OfficialCard({
  item,
  onAddPress,
  plusRef,
}: {
  item: any;
  onAddPress: (id: string) => void;
  plusRef?: React.RefObject<any>;
}) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const { width: screenWidth } = useWindowDimensions();

  return (
    <Pressable
      onPress={() => router.navigate(`/official/${item.bioguideId}`)}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
        borderRadius: 48,
      })}
    >
      <View
        style={[
          componentStyles.officialCard,
          { paddingVertical: 16, borderWidth: 2, borderColor: "transparent" },
        ]}
      >
        {/* Avatar column — 64px wide, avatar 50px */}
        <View
          style={{
            width: 64,
            marginRight: 12,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              overflow: "hidden",
              backgroundColor: "#eee",
            }}
          >
            {item.depiction?.imageUrl && !imageError ? (
              <Image
                source={{ uri: item.depiction.imageUrl }}
                style={{ width: "100%", height: "120%" }}
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
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  {item.name?.split(",")[0]?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* Official Info */}
        <View style={{ flex: 1 }}>
          <Text style={componentStyles.name} numberOfLines={1}>
            {item.name?.includes(",")
              ? item.name
                  .split(",")
                  .reverse()
                  .map((s: string) => s.trim())
                  .join(" ")
              : item.name}
          </Text>
          <View style={[componentStyles.metaRow, { flexWrap: "nowrap" }]}>
            <Text style={[componentStyles.subtitle, { flexShrink: 0 }]}>
              {item.partyName?.charAt(0) || ""}
            </Text>
            <Text style={[componentStyles.separator, { flexShrink: 0 }]}>
              ·
            </Text>
            <Text
              style={[componentStyles.subtitle, { flexShrink: 1 }]}
              numberOfLines={1}
            >
              {formatRole(item.chamber, item.state, item.district, screenWidth)}
            </Text>
          </View>
        </View>
        {/* Plus Button */}
        <View ref={plusRef} collapsable={false}>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onAddPress(item.bioguideId);
            }}
            style={({ pressed }) => ({
              padding: 8,
              transform: [{ scale: pressed ? 0.9 : 1 }],
            })}
          >
            <Plus size={24} color="#008CFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
});
