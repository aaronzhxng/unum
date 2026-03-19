import { ChevronLeft, Plus } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { styles as componentStyles } from "../global_styles/styles";
import { getBillIcon } from "../utils/billIcons";
import AddModal from "./AddModal";

const POLICY_AREA_COLORS: Record<string, string> = {
  "Agriculture and Food": "#7CB342",
  Animals: "#8D6E63",
  "Armed Forces and National Security": "#455A64",
  "Arts, Culture, Religion": "#AB47BC",
  "Civil Rights and Liberties, Minority Issues": "#E53935",
  Commerce: "#00ACC1",
  Congress: "#1565C0",
  "Crime and Law Enforcement": "#424242",
  "Economics and Public Finance": "#4CAF82",
  Education: "#F5A623",
  "Emergency Management": "#FF5722",
  Energy: "#E67E22",
  "Environmental Protection": "#43A047",
  Families: "#F06292",
  "Finance and Financial Sector": "#4CAF82",
  "Foreign Trade and International Finance": "#9B59B6",
  "Government Operations and Politics": "#6B7FD4",
  Health: "#E53935",
  "Housing and Community Development": "#FF8F00",
  Immigration: "#00897B",
  "International Affairs": "#1E88E5",
  "Labor and Employment": "#6D4C41",
  Law: "#546E7A",
  "Native Americans": "#BF360C",
  "Public Lands and Natural Resources": "#27AE60",
  "Science, Technology, Communications": "#0288D1",
  "Social Welfare": "#E91E8C",
  "Sports and Recreation": "#00BCD4",
  Taxation: "#F9A825",
  "Transportation and Public Works": "#5C6BC0",
  "Water Resources Development": "#0277BD",
};

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  query?: string;
  searchContext?: string; // e.g., "My List", "Swing States"
  items?: any[]; // The items to search through
  onItemPress?: (item: any) => void; // Handle item selection
  onNewListPress: (item?: any) => void;
}

export default function SearchModal({
  isVisible,
  onClose,
  onSearch,
  query,
  searchContext = "this list",
  items = [],
  onItemPress,
  onNewListPress,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAddItem, setSelectedAddItem] = useState<any>(null);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Define handleClose first so useEffect can reference it
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    setSearchQuery("");
    setFilteredItems([]);
    onClose();
  }, [onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Sync external query
  useEffect(() => {
    setSearchQuery(query || "");
  }, [query]);

  // Filter items based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems([]);
      return;
    }

    const lowercaseQuery = searchQuery.toLowerCase();
    const queryWords = lowercaseQuery.trim().split(/\s+/);

    const matchesAll = (text: string) => {
      const lower = text.toLowerCase();
      return queryWords.every((word) => lower.includes(word));
    };

    const filtered = items.filter((item) => {
      if (item.name && matchesAll(item.name)) return true;
      if (item.role && matchesAll(item.role)) return true;
      if (item.party && matchesAll(item.party)) return true;

      const latestActionText =
        typeof item.latestAction === "string"
          ? item.latestAction
          : item.latestAction?.text;
      if (latestActionText && matchesAll(latestActionText)) return true;

      if (item.title && matchesAll(item.title)) return true;

      if (matchesAll(`${item.type} ${item.number}`)) return true;
      if (matchesAll(`${item.type}.${item.number}`)) return true;

      return false;
    });

    setFilteredItems(filtered);
    onSearch(searchQuery);
  }, [searchQuery, items, onSearch]);

  const handleSubmit = () => {
    Keyboard.dismiss();
  };

  const handleItemPress = (item: any) => {
    if (onItemPress) {
      onItemPress(item);
      handleClose();
    }
  };

  const handleAddPress = (item: any, event: any) => {
    event.stopPropagation();
    Keyboard.dismiss();

    // Determine type based on item properties
    const itemType = item.billType
      ? "bill"
      : item.bioguideId || item.depiction || item.terms
        ? "official"
        : item.type || "bill";
    setSelectedAddItem({
      ...item,
      type: itemType,
    });
    setShowAddModal(true);
  };

  const safeFormatDate = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    if (!y || !m || !d) return "";
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  };

  if (!isVisible) return null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={{ margin: 0 }}
      backdropOpacity={1}
      backdropColor="#fff"
      animationIn="slideInRight"
      animationOut="slideOutRight"
      animationInTiming={250}
      animationOutTiming={200}
      statusBarTranslucent
      useNativeDriver
      coverScreen={true}
    >
      <View style={[componentStyles.container, { marginBottom: 96 }]}>
        {/* Search Header */}
        <View style={componentStyles.headerBar}>
          <TouchableOpacity
            onPress={handleClose}
            style={{ marginRight: 8, paddingHorizontal: 4 }}
          >
            <ChevronLeft size={24} color="#535353" />
          </TouchableOpacity>

          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderColor: "#bfbfbf",
              borderWidth: 1,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <TextInput
              ref={inputRef}
              style={{
                flex: 1,
                fontSize: 16,
                color: "#212529",
                paddingVertical: 0,
              }}
              placeholder="Search"
              placeholderTextColor="#adb5bd"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={handleSubmit}
              blurOnSubmit={false}
            />
          </View>
        </View>

        {/* Search Results Area */}
        <View style={{ flex: 1 }}>
          {!searchQuery ? (
            <Text
              style={[
                componentStyles.subtitle,
                { alignSelf: "center", marginTop: 16 },
              ]}
            >
              Start typing to search
            </Text>
          ) : filteredItems.length === 0 ? (
            <Text
              style={[
                componentStyles.subtitle,
                { alignSelf: "center", marginTop: 16 },
              ]}
            >
              No results for "{searchQuery}" in {searchContext}
            </Text>
          ) : (
            <>
              <Text
                style={[
                  componentStyles.subtitle,
                  { marginLeft: 16, marginTop: 16, marginBottom: 8 },
                ]}
              >
                {filteredItems.length} result
                {filteredItems.length !== 1 ? "s" : ""} for "{searchQuery}" in{" "}
                {searchContext}
              </Text>
              <FlatList
                data={filteredItems}
                keyExtractor={(item, index) =>
                  item.id ||
                  item.bioguideId ||
                  (item.billType && item.number
                    ? `${item.billType}${item.number}`
                    : null) ||
                  (item.type && item.number
                    ? `${item.type}${item.number}`
                    : null) ||
                  index.toString()
                }
                contentContainerStyle={componentStyles.listContent}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleItemPress(item)}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}
                  >
                    <View style={componentStyles.officialCard}>
                      {/* Avatar */}
                      {item.type === "bill" ? null : (
                        <OfficialAvatar item={item} />
                      )}

                      {/* Content */}
                      {item.type === "bill" ? (
                        (() => {
                          const policyArea =
                            item.policyArea?.name ?? item.policyArea ?? null;
                          const dotColor =
                            POLICY_AREA_COLORS[policyArea] ?? "#008CFF";
                          const dateStr = safeFormatDate(
                            item.latestAction?.actionDate ?? item.date,
                          );

                          return (
                            <>
                              {/* Left column: badge + icon */}
                              <View
                                style={{
                                  alignItems: "center",
                                  marginRight: 12,
                                  flexShrink: 0,
                                  width: 64,
                                }}
                              >
                                <View
                                  style={{
                                    backgroundColor: dotColor,
                                    borderRadius: 6,
                                    paddingHorizontal: 6,
                                    paddingVertical: 4,
                                    marginBottom: 6,
                                    alignItems: "center",
                                    width: "100%",
                                  }}
                                >
                                  <Text
                                    style={{
                                      color: "#fff",
                                      fontSize: 12,
                                      fontWeight: "700",
                                    }}
                                    numberOfLines={1}
                                  >
                                    {item.billType || item.type}.{item.number}
                                  </Text>
                                </View>
                                <Image
                                  source={getBillIcon(policyArea)}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: 6,
                                  }}
                                  resizeMode="contain"
                                />
                              </View>

                              {/* Info */}
                              <View
                                style={{
                                  flex: 1,
                                  alignSelf: "stretch",
                                  justifyContent: "space-between",
                                }}
                              >
                                <View>
                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      flexWrap: "nowrap",
                                      marginBottom: 4,
                                    }}
                                  >
                                    {dateStr && (
                                      <Text
                                        style={[
                                          componentStyles.subtitle,
                                          { flexShrink: 0 },
                                        ]}
                                      >
                                        {dateStr}
                                      </Text>
                                    )}
                                    {policyArea && (
                                      <>
                                        <Text style={componentStyles.separator}>
                                          ·
                                        </Text>
                                        <Text
                                          style={{
                                            fontSize: 12,
                                            color: dotColor,
                                            fontWeight: "600",
                                            flexShrink: 1,
                                          }}
                                          numberOfLines={1}
                                        >
                                          {policyArea}
                                        </Text>
                                      </>
                                    )}
                                  </View>
                                  <Text
                                    style={componentStyles.name}
                                    numberOfLines={2}
                                  >
                                    {item.title ??
                                      (item.name?.includes(" - ")
                                        ? item.name
                                            .split(" - ")
                                            .slice(1)
                                            .join(" - ")
                                        : item.name)}
                                  </Text>
                                </View>
                                <Text
                                  style={componentStyles.subtitle}
                                  numberOfLines={1}
                                >
                                  {typeof item.latestAction === "string"
                                    ? item.latestAction
                                    : (item.latestAction?.text ?? "")}
                                </Text>
                              </View>
                            </>
                          );
                        })()
                      ) : (
                        // Official info
                        <View style={{ flex: 1 }}>
                          <Text style={componentStyles.name}>
                            {item.name?.includes(",")
                              ? item.name
                                  .split(",")
                                  .reverse()
                                  .map((s: string) => s.trim())
                                  .join(" ")
                              : item.name}
                          </Text>
                          <View style={componentStyles.metaRow}>
                            <Text style={componentStyles.subtitle}>
                              {item.partyName?.charAt(0) || item.party || ""}
                              {(item.partyName || item.party) && " · "}
                              {item.chamber
                                ? formatRole(
                                    item.chamber,
                                    item.state,
                                    item.district,
                                  )
                                : (item.role ?? "")}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Add Button */}
                      <Pressable
                        onPress={(e) => handleAddPress(item, e)}
                        style={({ pressed }) => ({
                          padding: 8,
                          transform: [{ scale: pressed ? 0.75 : 1 }],
                        })}
                      >
                        <Plus size={24} color="#008CFF" />
                      </Pressable>
                    </View>
                  </Pressable>
                )}
              />
            </>
          )}
        </View>
      </View>

      {/* Add Modal */}
      <AddModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
        onNewListPress={(item) => {
          onNewListPress(item);
        }}
        currentItem={
          selectedAddItem
            ? {
                id:
                  selectedAddItem.id ??
                  selectedAddItem.bioguideId ??
                  (selectedAddItem.billType && selectedAddItem.number
                    ? `${selectedAddItem.billType.toLowerCase()}${selectedAddItem.number}`
                    : ""),
                type:
                  selectedAddItem.bioguideId ||
                  selectedAddItem.depiction ||
                  selectedAddItem.terms
                    ? "official"
                    : "bill",
                name: selectedAddItem.name,
                party:
                  selectedAddItem.party ?? selectedAddItem.partyName?.charAt(0),
                role:
                  selectedAddItem.role ??
                  (selectedAddItem.chamber === "House of Representatives"
                    ? `Representative, ${selectedAddItem.state}${selectedAddItem.district ? `, District ${selectedAddItem.district}` : ""}`
                    : `Senator, ${selectedAddItem.state}`),
                date: selectedAddItem.date,
                latestAction:
                  typeof selectedAddItem.latestAction === "string"
                    ? selectedAddItem.latestAction
                    : (selectedAddItem.latestAction as any)?.text,
                policyArea:
                  selectedAddItem.policyArea?.name ??
                  selectedAddItem.policyArea,
                photoUrl:
                  selectedAddItem.photoUrl ??
                  selectedAddItem.depiction?.imageUrl,
              }
            : undefined
        }
      />
    </Modal>
  );
}

function formatRole(
  chamber: string,
  state: string,
  district?: number | null,
): string {
  if (chamber === "House of Representatives") {
    const full = `Representative, ${state}${district ? `, District ${district}` : ""}`;
    const abbr = `Rep, ${state}${district ? `, District ${district}` : ""}`;
    return full.length > 39 ? abbr : full;
  }
  const full = `Senator, ${state}`;
  const abbr = `Sen, ${state}`;
  return full.length > 40 ? abbr : full;
}

function OfficialAvatar({ item }: { item: any }) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = item.depiction?.imageUrl || item.photoUrl || null;

  return (
    <View style={componentStyles.avatar}>
      {imageUrl && !imageError ? (
        <Image
          source={{ uri: imageUrl }}
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
          <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
            {item.name?.split(",")[0]?.charAt(0) || "?"}
          </Text>
        </View>
      )}
    </View>
  );
}
