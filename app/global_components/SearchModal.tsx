import { ChevronLeft } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import { styles as componentStyles } from "../global_styles/styles";

interface SearchModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSearch: (query: string) => void;
  query?: string;
}

export default function SearchModal({
  isVisible,
  onClose,
  onSearch,
  query,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(query || "");
  const inputRef = useRef<TextInput>(null);

  // Define handleClose first so useEffect can reference it
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  // Focus input when modal opens
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [isVisible]);

  // Android hardware back button
  useEffect(() => {
    if (!isVisible) return;
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleClose();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [isVisible, handleClose]); // handleClose in deps so it's never stale

  // Sync external query
  useEffect(() => {
    setSearchQuery(query || "");
  }, [query]);

  const handleSubmit = () => {
    Keyboard.dismiss();
    onSearch(searchQuery);
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
          {searchQuery ? (
            <Text
              style={[
                componentStyles.subtitle,
                { alignSelf: "center", marginTop: 16 },
              ]}
            >
              Searching for "{searchQuery}"...
            </Text>
          ) : (
            <Text
              style={[
                componentStyles.subtitle,
                { alignSelf: "center", marginTop: 16 },
              ]}
            >
              Start typing to search
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}
