import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React, { useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useOnboarding } from "../context/OnboardingContext";

export default function NameListScreen() {
  const router = useRouter();
  const { listName, setListName, selectedOfficials, selectedBills } =
    useOnboarding();
  const inputRef = useRef<TextInput>(null);

  const totalItems = selectedOfficials.length + selectedBills.length;

  const handleContinue = () => {
    if (!listName.trim()) return;
    router.push("/onboarding/finish" as any);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fafafa" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Header */}
      <View
        style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 }}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <ChevronLeft size={28} color="#535353" />
        </Pressable>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 8,
          }}
        >
          Name your list
        </Text>
        <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
          {totalItems > 0
            ? `Your ${totalItems} selected item${totalItems > 1 ? "s" : ""} will be added to this list.`
            : "Give your first list a name to get started."}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, flex: 1 }}>
        {/* Text input */}
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{
            backgroundColor: "#fff",
            borderRadius: 24, // was 16
            padding: 16,
            borderWidth: 2,
            borderColor: listName.trim() ? "#008CFF" : "transparent", // was "#E0E0E0"
            shadowColor: "#000000",
            shadowOpacity: 0.15,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <TextInput
            ref={inputRef}
            value={listName}
            onChangeText={setListName}
            placeholder="e.g. My List, Politics 2026, Watch List..."
            placeholderTextColor="#aaa"
            style={{
              fontSize: 16,
              color: "#1a1a1a",
              padding: 0,
            }}
            autoFocus
            maxLength={40}
            returnKeyType="done"
            onSubmitEditing={handleContinue}
          />
        </Pressable>

        {/* Character count */}
        <Text
          style={{
            fontSize: 12,
            color: "#aaa",
            textAlign: "right",
            marginTop: 6,
          }}
        >
          {listName.length}/40
        </Text>

        {/* Summary of selections */}
        {totalItems > 0 && (
          <View
            style={{
              backgroundColor: "#E8F4FF",
              borderRadius: 12,
              padding: 14,
              marginTop: 24,
            }}
          >
            <Text style={{ fontSize: 13, color: "#008CFF", fontWeight: "600" }}>
              What's going in your list:
            </Text>
            {selectedOfficials.length > 0 && (
              <Text style={{ fontSize: 13, color: "#535353", marginTop: 6 }}>
                · {selectedOfficials.length} official
                {selectedOfficials.length > 1 ? "s" : ""}
              </Text>
            )}
            {selectedBills.length > 0 && (
              <Text style={{ fontSize: 13, color: "#535353", marginTop: 4 }}>
                · {selectedBills.length} bill
                {selectedBills.length > 1 ? "s" : ""}
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Bottom Buttons */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
        }}
      >
        {/* Dot indicators */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <View
              key={i}
              style={{
                width: i === 5 ? 20 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === 5 ? "#008CFF" : "#D0D0D0",
              }}
            />
          ))}
        </View>

        <Pressable
          onPress={handleContinue}
          style={({ pressed }) => ({
            backgroundColor: listName.trim() ? "#008CFF" : "#ccc",
            paddingVertical: 16,
            borderRadius: 32,
            alignItems: "center",
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
          disabled={!listName.trim()}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
            Build My List
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
