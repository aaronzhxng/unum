import React, { useEffect, useRef } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles } from "../global_styles/styles";

interface NewListNameModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (listName: string) => void;
  value: string;
  onChangeText: (text: string) => void;
}

export default function NewListNameModal({
  visible,
  onClose,
  onConfirm,
  value,
  onChangeText,
}: NewListNameModalProps) {
  const inputRef = useRef<TextInput>(null);

  // Focus input when modal becomes visible
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleCancel = () => {
    Keyboard.dismiss();
    onClose();
  };

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable style={styles.modalOverlay} onPress={handleCancel}>
          <Pressable onPress={() => {}}>
            <View style={styles.subModalCard}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: 16,
                }}
              >
                New List
              </Text>

              <TextInput
                ref={inputRef}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: "#535353",
                  fontSize: 15,
                  color: "#1a1a1a",
                  paddingVertical: 6,
                  marginBottom: 4,
                }}
                placeholder="List name"
                placeholderTextColor="#adb5bd"
                value={value}
                onChangeText={onChangeText}
                returnKeyType="done"
                onSubmitEditing={handleConfirm}
              />

              <View style={styles.actionRow}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { transform: pressed ? [{ scale: 0.96 }] : [] },
                  ]}
                  onPress={handleCancel}
                >
                  <Text style={{ fontSize: 16, color: "#535353" }}>Cancel</Text>
                </Pressable>

                <View style={styles.verticalDivider} />

                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    {
                      transform:
                        pressed && value.trim() ? [{ scale: 0.96 }] : [],
                    },
                  ]}
                  onPress={handleConfirm}
                  disabled={!value.trim()}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: value.trim() ? "#008CFF" : "#bfbfbf",
                    }}
                  >
                    Create
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
