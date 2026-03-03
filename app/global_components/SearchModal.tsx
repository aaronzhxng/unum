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
    const filtered = items.filter((item) => {
      // Search in name (for stored list items)
      if (item.name?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in role (for officials)
      if (item.role?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in party
      if (item.party?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in latestAction (for stored list items)
      const latestActionText =
        typeof item.latestAction === "string"
          ? item.latestAction
          : item.latestAction?.text;
      if (latestActionText?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in bill title (for legislation.tsx API bills)
      if (item.title?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in bill type + number (e.g. "HR 1234")
      if (`${item.type} ${item.number}`.toLowerCase().includes(lowercaseQuery))
        return true;
      if (`${item.type}.${item.number}`.toLowerCase().includes(lowercaseQuery))
        return true;

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

  if (!isVisible) return null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      style={{ margin: 0 }}
      backdropOpacity={0}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      animationInTiming={250}
      animationOutTiming={200}
      statusBarTranslucent
      useNativeDriver
    >
      <View style={componentStyles.container}>
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
                      {item.type === "bill" ? (
                        // Bill icon
                        <View
                          style={[
                            componentStyles.avatar,
                            {
                              backgroundColor: "#eee",
                              justifyContent: "center",
                              alignItems: "center",
                            },
                          ]}
                        >
                          {item.policyArea?.name || item.policyArea ? (
                            <Image
                              source={getBillIcon(
                                item.policyArea?.name || item.policyArea,
                              )}
                              style={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 6,
                              }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "bold",
                                color: "#535353",
                              }}
                            >
                              {item.billType || item.type}
                            </Text>
                          )}
                        </View>
                      ) : item.depiction?.imageUrl ? (
                        // Official with depiction
                        <View style={componentStyles.avatar}>
                          <Image
                            source={{ uri: item.depiction.imageUrl }}
                            style={{ width: "100%", height: "120%" }}
                            resizeMode="cover"
                          />
                        </View>
                      ) : item.photoUrl ? (
                        // Official with photoUrl (stored item)
                        <View style={componentStyles.avatar}>
                          <Image
                            source={{ uri: item.photoUrl }}
                            style={{ width: "100%", height: "120%" }}
                            resizeMode="cover"
                          />
                        </View>
                      ) : (
                        // Fallback initials
                        <View style={componentStyles.avatar}>
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
                              {item.name?.split(",")[0]?.charAt(0) || "?"}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Content */}
                      {item.type === "bill" ? (
                        <View style={{ flex: 1, gap: 4 }}>
                          <View
                            style={[
                              componentStyles.metaRow,
                              { flexWrap: "nowrap" },
                            ]}
                          >
                            <Text
                              style={[
                                componentStyles.subtitle,
                                { flexShrink: 0 },
                              ]}
                            >
                              {item.latestAction?.actionDate
                                ? new Date(
                                    item.latestAction.actionDate,
                                  ).toLocaleDateString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric",
                                  })
                                : item.date}
                            </Text>
                            {(item.policyArea?.name || item.policyArea) && (
                              <>
                                <Text style={componentStyles.separator}>·</Text>
                                <Text
                                  style={[
                                    componentStyles.subtitle,
                                    { flexShrink: 1 },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {item.policyArea?.name || item.policyArea}
                                </Text>
                              </>
                            )}
                          </View>
                          <Text style={componentStyles.name} numberOfLines={2}>
                            {item.title
                              ? `${item.type}.${item.number} - ${item.title}`
                              : item.name}
                          </Text>
                          <Text
                            style={componentStyles.subtitle}
                            numberOfLines={1}
                          >
                            {typeof item.latestAction === "string"
                              ? item.latestAction
                              : item.latestAction?.text}
                          </Text>
                        </View>
                      ) : (
                        // Official info
                        <View style={{ flex: 1 }}>
                          <Text style={componentStyles.name}>{item.name}</Text>
                          <View style={componentStyles.metaRow}>
                            <Text style={componentStyles.subtitle}>
                              {item.partyName?.charAt(0) || item.party || ""}
                              {(item.partyName || item.party) && " · "}
                              {item.chamber === "House of Representatives"
                                ? `Representative, ${item.state}${item.district ? `, District ${item.district}` : ""}`
                                : item.role || `Senator, ${item.state}`}
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
