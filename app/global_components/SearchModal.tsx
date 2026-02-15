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
import AddModal from "./AddModal";

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  query?: string;
  searchContext?: string; // e.g., "My List", "Swing States"
  items?: any[]; // The items to search through
  onItemPress?: (item: any) => void; // Handle item selection
}

export default function SearchModal({
  isVisible,
  onClose,
  onSearch,
  query,
  searchContext = "this list",
  items = [],
  onItemPress,
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
      // Search in name (always present)
      if (item.name?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in role (for officials)
      if (item.role?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in committee (for bills)
      if (item.committee?.toLowerCase().includes(lowercaseQuery)) return true;

      // Search in party
      if (item.party?.toLowerCase().includes(lowercaseQuery)) return true;

      return false;
    });

    setFilteredItems(filtered);
    onSearch(searchQuery);
  }, [searchQuery, items, onSearch]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSearch(searchQuery);
  };

  const handleItemPress = (item: any) => {
    if (onItemPress) {
      onItemPress(item);
      handleClose();
    }
  };

  const handleAddPress = (item: any, event: any) => {
    event.stopPropagation(); // Prevent card navigation
    Keyboard.dismiss(); // 👈 Add this line
    setSelectedAddItem(item);
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
                { alignSelf: "center", marginTop: 16, marginBottom: 16 },
              ]}
            >
              Start typing to search
            </Text>
          ) : filteredItems.length === 0 ? (
            <Text
              style={[
                componentStyles.subtitle,
                { alignSelf: "center", marginTop: 16, marginBottom: 16 },
              ]}
            >
              No results for "{searchQuery}" in {searchContext}
            </Text>
          ) : (
            <>
              <Text
                style={[
                  componentStyles.subtitle,
                  { alignSelf: "center", marginTop: 16, marginBottom: 16 },
                ]}
              >
                {filteredItems.length} result
                {filteredItems.length !== 1 ? "s" : ""} for "{searchQuery}" in{" "}
                {searchContext}
              </Text>
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                contentContainerStyle={componentStyles.listContent}
                keyboardShouldPersistTaps="handled" // 👈 Add this
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => handleItemPress(item)}
                    style={({ pressed }) => ({
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    })}
                  >
                    <View style={componentStyles.officialCard}>
                      <Image
                        source={item.avatar}
                        style={componentStyles.avatar}
                      />

                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={componentStyles.name} numberOfLines={1}>
                          {item.name}
                        </Text>

                        <View style={componentStyles.metaRow}>
                          {item.party && (
                            <>
                              <Text style={componentStyles.subtitle}>
                                {item.party}
                              </Text>
                              <Text style={componentStyles.separator}>·</Text>
                            </>
                          )}
                          {item.role && (
                            <Text
                              style={componentStyles.subtitle}
                              numberOfLines={1}
                            >
                              {item.role}
                            </Text>
                          )}
                          {item.date && (
                            <>
                              <Text style={componentStyles.subtitle}>
                                {item.date}
                              </Text>
                              <Text style={componentStyles.separator}>·</Text>
                            </>
                          )}
                          {item.committee && (
                            <Text
                              style={componentStyles.subtitle}
                              numberOfLines={1}
                            >
                              {item.committee}
                            </Text>
                          )}
                          {item.update && (
                            <>
                              <Text style={componentStyles.separator}>·</Text>
                              <Text style={componentStyles.update}>
                                {item.update}
                              </Text>
                            </>
                          )}
                        </View>
                      </View>

                      {/* Add Button */}
                      <Pressable
                        onPress={(e) => handleAddPress(item, e)}
                        style={({ pressed }) => ({
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: pressed ? "#e0e0e0" : "#f0f0f0",
                          justifyContent: "center",
                          alignItems: "center",
                        })}
                      >
                        <Plus size={20} color="#535353" strokeWidth={2.5} />
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
      />
    </Modal>
  );
}
