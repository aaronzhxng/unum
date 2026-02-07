import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  View,
} from "react-native";
import Modal from "react-native-modal";

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
  query = "",
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = React.useState(query);
  const inputRef = React.useRef<TextInput>(null);

  // Focus when modal becomes visible
  React.useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // ↑ Increased to 300ms
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Focus AGAIN after modal fully shows
  const handleOnShow = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  React.useEffect(() => {
    setSearchQuery(query);
  }, [query]);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {
        Keyboard.dismiss(); // Close keyboard
        setTimeout(onClose); // Close modal after
      }}
      onShow={handleOnShow}
      style={{ margin: 0, justifyContent: "flex-end" }}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={700} // ← ADD: 500ms (slower slide up)
      animationOutTiming={700} // ← ADD: 400ms (slide down)
      backdropTransitionInTiming={700} // ← ADD: Backdrop fade matches
      backdropTransitionOutTiming={700} // ← ADD: Backdrop fade matches
    >
      <KeyboardAvoidingView
        enabled
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          backgroundColor: "white",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <View style={{ padding: 20, paddingTop: 10 }}>
          <TextInput
            ref={inputRef}
            style={{
              borderWidth: 1,
              borderColor: "#bfbfbf",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              fontSize: 16,
              marginTop: 12,
            }}
            placeholder="Search legislation..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            // bluronSubmit={false}
            onSubmitEditing={() => {
              onSearch(searchQuery);
              onClose();
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
