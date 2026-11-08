import { useFocusEffect } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  MapPinned,
  MoreVertical,
  Search,
} from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BackHandler,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useTour } from "../context/TourContext";
import AddModal from "../global_components/AddModal";
import ErrorScreen from "../global_components/ErrorScreen";
import LoadingSpinner from "../global_components/LoadingSpinner";
import NewListNameModal from "../global_components/NewListNameModal";
import OfficialCard, {
  TERRITORY_STATES,
} from "../global_components/OfficialCard";
import OfficialsOptionsModal from "../global_components/OfficialsOptionsModal";
import ReportErrorModal from "../global_components/ReportErrorModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";
import {
  COMMITTEES_STALE_MS,
  committeeLabel,
  committeesService,
} from "../services/committees";
import { officialsService } from "../services/officials";
import { LIST_UPDATED, listEvents } from "../utils/listEvents";
import { notificationPreferences } from "../utils/notificationPreferences";
import { houseTitle, placeKind } from "../utils/officialTitle";
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

const DROPDOWN_TABS = ["States", "Committees"] as const;
const COMMITTEE_CHAMBERS = ["House", "Senate", "Joint"] as const;

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
  // A chosen committee takes over the list from selectedList. The dropdown's
  // tab only changes what it offers until something in it is picked.
  const [selectedCommitteeId, setSelectedCommitteeId] = useState<string | null>(
    null,
  );
  // Null shows the full committee
  const [selectedSubcommitteeId, setSelectedSubcommitteeId] = useState<
    string | null
  >(null);
  const [dropdownTab, setDropdownTab] =
    useState<(typeof DROPDOWN_TABS)[number]>("States");
  const [committeeChamber, setCommitteeChamber] =
    useState<(typeof COMMITTEE_CHAMBERS)[number]>("House");

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
                ? `${houseTitle(pendingItemForNewList.state).full}, ${pendingItemForNewList.state}${pendingItemForNewList.district ? `, District ${pendingItemForNewList.district}` : ""}`
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

  const committeesQuery = useQuery({
    queryKey: ["committees"],
    queryFn: committeesService.getAll,
    enabled: dropdownTab === "Committees",
    staleTime: COMMITTEES_STALE_MS,
  });
  const committees = committeesQuery.data?.committees ?? [];
  const selectedCommittee = committees.find(
    (c) => c.id === selectedCommitteeId,
  );
  // Copies saved before subcommittees were added have none
  const subcommittees = selectedCommittee?.subcommittees ?? [];
  const selectedSubcommittee = subcommittees.find(
    (s) => s.id === selectedSubcommitteeId,
  );
  const listTitle = selectedCommittee
    ? committeeLabel(selectedCommittee)
    : selectedList;

  // Filter officials based on the selected committee or state
  const officials = useMemo(() => {
    if (selectedCommittee) {
      // Already in committee order. Anyone missing from the officials list,
      // like a member sworn in today, joins once that list catches up.
      const byId = new Map(allOfficials.map((o) => [o.bioguideId, o]));
      const members = (selectedSubcommittee ?? selectedCommittee).members;
      return members.flatMap((member) => {
        const official = byId.get(member.bioguideId);
        return official ? [{ ...official, committeeTitle: member.title }] : [];
      });
    }
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
  }, [allOfficials, selectedList, selectedCommittee, selectedSubcommittee]);

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
        {/* State name shrinks (with an ellipsis) before the map button does */}
        <View
          style={[
            componentStyles.headerLeft,
            { flex: 1, minWidth: 0, marginRight: 16 },
          ]}
        >
          <View
            ref={stateDropdownRef}
            collapsable={false}
            style={{ flexShrink: 1 }}
          >
            <Pressable
              onPress={() => {
                // Opens on what's showing. From a state, the Committees tab
                // still remembers the chamber last looked at.
                setDropdownTab(selectedCommittee ? "Committees" : "States");
                if (selectedCommittee) {
                  setCommitteeChamber(selectedCommittee.chamber);
                }
                setShowListSelection(!showListSelection);
              }}
              style={({ pressed }) => ({
                flexShrink: 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 1,
                }}
              >
                <Text
                  style={[
                    componentStyles.header,
                    selectedCommittee
                      ? { flexShrink: 1 }
                      : { alignItems: "center", maxWidth: 220, flexShrink: 1 },
                  ]}
                  // About a third of committee names need the second line.
                  // The longest, like "Senate Homeland Security and
                  // Governmental Affairs", shrink a little on narrow phones
                  // rather than end in "…".
                  numberOfLines={selectedCommittee ? 2 : 1}
                  adjustsFontSizeToFit={!!selectedCommittee}
                  minimumFontScale={0.8}
                  ellipsizeMode="tail"
                >
                  {listTitle}
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
          {!selectedCommittee && (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/congressional-map",
                  params: { state: selectedList },
                } as any)
              }
              hitSlop={6}
              accessibilityLabel="Open congressional district map"
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                flexShrink: 0,
                marginLeft: 10,
                marginBottom: 12,
                paddingVertical: 6,
                paddingLeft: 10,
                paddingRight: 12,
                borderRadius: 999,
                backgroundColor: "#E8F4FF",
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <MapPinned size={18} color="#008CFF" />
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#008CFF" }}
              >
                District map
              </Text>
            </Pressable>
          )}
        </View>

        <View style={componentStyles.headerRight}>
          {/* Committees are short enough to scroll, and the name needs the room */}
          {!selectedCommittee && (
            <Pressable
              onPress={() => setShowSearchModal(true)}
              style={({ pressed }) => ({
                transform: [{ scale: pressed ? 0.75 : 1 }],
              })}
            >
              <Search size={24} color="#535353" />
            </Pressable>
          )}
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

      {subcommittees.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          {/* Bleeds to the screen edges so chips scroll off them */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -16 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
          >
            {[null, ...subcommittees].map((sub) => {
              const isSelected = (sub?.id ?? null) === selectedSubcommitteeId;
              return (
                <Pressable
                  key={sub?.id ?? "full"}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedSubcommitteeId(sub?.id ?? null)}
                  style={({ pressed }) => ({
                    maxWidth: 220,
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: 999,
                    backgroundColor: isSelected ? "#E8F4FF" : "#efefef",
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? "600" : "400",
                      color: isSelected ? "#008CFF" : "#535353",
                    }}
                  >
                    {sub ? sub.name : "Full committee"}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {/* Chips cut long names short, so the chosen one is spelled out */}
          {selectedSubcommittee && (
            <Text
              style={{
                fontSize: 13,
                color: "#7B7C81",
                marginTop: 8,
                marginLeft: componentStyles.header.marginLeft,
              }}
            >
              Subcommittee on {selectedSubcommittee.name}
            </Text>
          )}
        </View>
      )}

      <FlatList
        // A new list starts at the top, so a committee opens on its chair
        key={selectedSubcommitteeId ?? selectedCommitteeId ?? selectedList}
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
                ? `${houseTitle(official.state).full}, ${official.state}${official.district ? `, District ${official.district}` : ""}`
                : `Senator, ${official.state}`,
            photoUrl: (official as any).depiction?.imageUrl || undefined,
          };
        })()}
      />

      {/* Search Modal */}
      <SearchModal
        isVisible={showSearchModal}
        skipEntryAnimation={searchInstantOpen}
        onClose={() => {
          setSearchInstantOpen(false);
          setShowSearchModal(false);
        }}
        onNavigatingAway={() => {
          searchNavigatedAwayRef.current = true;
          setShowSearchModal(false);
        }}
        onSearch={setSearchQuery}
        searchContext={listTitle}
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
        // The state actions are hidden while a committee is showing, since
        // they'd apply to a state that isn't on screen
        selectedState={selectedCommittee ? "All States" : selectedList}
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
          {/* A fixed height, so the card doesn't resize between short and long lists */}
          <View style={{ flex: 1, marginVertical: 96 }}>
            <View style={[componentStyles.dropdown, { flex: 1 }]}>
              <View
                accessibilityRole="tablist"
                style={{
                  flexDirection: "row",
                  borderBottomWidth: 1,
                  borderBottomColor: "#e0e0e0",
                }}
              >
                {DROPDOWN_TABS.map((tab) => (
                  <Pressable
                    key={tab}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: dropdownTab === tab }}
                    onPress={() => setDropdownTab(tab)}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      alignItems: "center",
                      marginBottom: -1,
                      borderBottomWidth: 2,
                      borderBottomColor:
                        dropdownTab === tab ? "#008CFF" : "transparent",
                    }}
                  >
                    <Text
                      style={[
                        componentStyles.dropdownItemText,
                        dropdownTab === tab
                          ? { fontWeight: "600", color: "#008CFF" }
                          : { color: "#535353" },
                      ]}
                    >
                      {tab}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {dropdownTab === "Committees" && (
                <View
                  accessibilityRole="tablist"
                  style={{
                    flexDirection: "row",
                    gap: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
                  {COMMITTEE_CHAMBERS.map((chamber) => {
                    const isSelected = committeeChamber === chamber;
                    return (
                      <Pressable
                        key={chamber}
                        accessibilityRole="tab"
                        accessibilityLabel={`${chamber} committees`}
                        accessibilityState={{ selected: isSelected }}
                        onPress={() => setCommitteeChamber(chamber)}
                        hitSlop={4}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 14,
                          borderRadius: 999,
                          backgroundColor: isSelected
                            ? "#E8F4FF"
                            : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: isSelected ? "600" : "400",
                            color: isSelected ? "#008CFF" : "#535353",
                          }}
                        >
                          {chamber}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {/* Keyed so switching tabs starts at the top of the new list */}
              <ScrollView
                key={dropdownTab === "States" ? "States" : committeeChamber}
                style={{ flex: 1 }}
              >
                {dropdownTab === "States" &&
                  [
                    ...(priorityState && priorityState !== "All States"
                      ? [priorityState]
                      : []),
                    ...LOCATION_OPTIONS.filter((o) => o !== priorityState),
                  ].map((option) => {
                    const stateNotifEnabled =
                      option !== "All States" && enabledStateNotifs.has(option);
                    const isSelected =
                      !selectedCommittee && selectedList === option;
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
                          setSelectedCommitteeId(null);
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
                                isSelected && { fontWeight: "600" },
                              ]}
                            >
                              {option}
                              {option === priorityState
                                ? ` (Priority ${placeKind(option)})`
                                : ""}
                            </Text>
                            {stateNotifEnabled && (
                              <Bell
                                size={14}
                                style={{ marginTop: 4 }}
                                color="#008CFF"
                              />
                            )}
                          </View>
                          {isSelected && (
                            <Check size={20} color="#008CFF" strokeWidth={4} />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}

                {dropdownTab === "Committees" &&
                  committees.length === 0 &&
                  (committeesQuery.isError ? (
                    <Pressable
                      style={componentStyles.dropdownItem}
                      onPress={() => committeesQuery.refetch()}
                    >
                      <Text style={componentStyles.dropdownItemText}>
                        Couldn't load committees. Tap to try again.
                      </Text>
                    </Pressable>
                  ) : (
                    <View style={{ padding: 24, alignItems: "center" }}>
                      <LoadingSpinner />
                    </View>
                  ))}

                {dropdownTab === "Committees" &&
                  committees
                    .filter((c) => c.chamber === committeeChamber)
                    .map((committee) => {
                      const isSelected = selectedCommitteeId === committee.id;
                      return (
                        <Pressable
                          key={committee.id}
                          style={({ pressed }) =>
                            pressed
                              ? componentStyles.dropdownItemPressed
                              : componentStyles.dropdownItem
                          }
                          onPress={() => {
                            setSelectedCommitteeId(committee.id);
                            setSelectedSubcommitteeId(null);
                            setShowListSelection(false);
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Text
                              style={[
                                componentStyles.dropdownItemText,
                                { flexShrink: 1 },
                                isSelected && { fontWeight: "600" },
                              ]}
                            >
                              {committee.shortName}
                            </Text>
                            {isSelected && (
                              <Check
                                size={20}
                                color="#008CFF"
                                strokeWidth={4}
                              />
                            )}
                          </View>
                        </Pressable>
                      );
                    })}
              </ScrollView>
            </View>
          </View>
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
