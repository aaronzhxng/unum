import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from "react-native";

const SHORT_SCREEN = Dimensions.get("window").height < 750;
import { styles as componentStyles } from "../global_styles/styles";
import { notificationPreferences } from "../utils/notificationPreferences";
import { syncPreferencesToBackend } from "../utils/syncPreferences";

const POLICY_AREA_OPTIONS = [
  { id: "Agriculture and Food", label: "Agriculture and Food" },
  { id: "Animals", label: "Animals" },
  {
    id: "Armed Forces and National Security",
    label: "Armed Forces and National Security",
  },
  { id: "Arts, Culture, Religion", label: "Arts, Culture, Religion" },
  {
    id: "Civil Rights and Liberties, Minority Issues",
    label: "Civil Rights and Liberties, Minority Issues",
  },
  { id: "Commerce", label: "Commerce" },
  { id: "Congress", label: "Congress" },
  { id: "Crime and Law Enforcement", label: "Crime and Law Enforcement" },
  { id: "Economics and Public Finance", label: "Economics and Public Finance" },
  { id: "Education", label: "Education" },
  { id: "Emergency Management", label: "Emergency Management" },
  { id: "Energy", label: "Energy" },
  { id: "Environmental Protection", label: "Environmental Protection" },
  { id: "Families", label: "Families" },
  { id: "Finance and Financial Sector", label: "Finance and Financial Sector" },
  {
    id: "Foreign Trade and International Finance",
    label: "Foreign Trade and International Finance",
  },
  {
    id: "Government Operations and Politics",
    label: "Government Operations and Politics",
  },
  { id: "Health", label: "Health" },
  {
    id: "Housing and Community Development",
    label: "Housing and Community Development",
  },
  { id: "Immigration", label: "Immigration" },
  { id: "International Affairs", label: "International Affairs" },
  { id: "Labor and Employment", label: "Labor and Employment" },
  { id: "Law", label: "Law" },
  { id: "Native Americans", label: "Native Americans" },
  {
    id: "Public Lands and Natural Resources",
    label: "Public Lands and Natural Resources",
  },
  {
    id: "Science, Technology, Communications",
    label: "Science, Technology, Communications",
  },
  { id: "Social Welfare", label: "Social Welfare" },
  { id: "Sports and Recreation", label: "Sports and Recreation" },
  { id: "Taxation", label: "Taxation" },
  {
    id: "Transportation and Public Works",
    label: "Transportation and Public Works",
  },
  { id: "Water Resources Development", label: "Water Resources Development" },
];

interface Props {
  showOptionsModal: boolean;
  setShowOptionsModal: React.Dispatch<React.SetStateAction<boolean>>;
  onReportError: () => void;
}

export default function LegislationOptionsModal({
  showOptionsModal,
  setShowOptionsModal,
  onReportError,
}: Props) {
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (showOptionsModal) {
      const saved = notificationPreferences.getSubTypes("policy_areas");
      setSelectedPolicyAreas(saved);
    }
  }, [showOptionsModal]);

  const togglePolicyArea = (id: string) => {
    setSelectedPolicyAreas((prev) => {
      if (id === "all") {
        return prev.length === POLICY_AREA_OPTIONS.length
          ? []
          : POLICY_AREA_OPTIONS.map((o) => o.id);
      }
      return prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id];
    });
  };

  const handleSavePolicyNotifs = () => {
    notificationPreferences.saveSubTypes(
      "policy_areas",
      "bill",
      selectedPolicyAreas,
    );
    syncPreferencesToBackend();
    setShowOptionsModal(false);
  };

  return (
    <Modal
      visible={showOptionsModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowOptionsModal(false)}
      statusBarTranslucent
    >
      <Pressable
        style={[componentStyles.modalOverlay, { justifyContent: "center" }]}
        onPress={() => setShowOptionsModal(false)}
      >
        <ScrollView
          style={{ maxHeight: "90%" }}
          contentContainerStyle={{
            padding: 0,
            justifyContent: "center",
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tips & Resources + Report an Error — shared dropdown, on top */}
          <View style={[componentStyles.dropdown, { marginBottom: 12 }]}>
            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={() => {
                setShowOptionsModal(false);
                router.push("/tips" as any);
              }}
            >
              <Text style={componentStyles.dropdownItemText}>
                Tips & Resources
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) =>
                pressed
                  ? componentStyles.dropdownItemPressed
                  : componentStyles.dropdownItem
              }
              onPress={() => {
                onReportError();
                setShowOptionsModal(false);
              }}
            >
              <Text
                style={[componentStyles.dropdownItemText, { color: "#FF3B30" }]}
              >
                Report an Error
              </Text>
            </Pressable>
          </View>

          {/* Policy Area Notifications */}
          <View
            style={[
              componentStyles.dropdownMulti,
              { marginBottom: 12, marginTop: 0 },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Text style={[componentStyles.dropdownItemTextLabel, { fontSize: SHORT_SCREEN ? 13 : 16 }]}>
                  Policy Area Notifications
                </Text>
                <Bell
                  size={14}
                  color={selectedPolicyAreas.length > 0 ? "#008CFF" : "#535353"}
                  style={{ marginTop: 12 }}
                />
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12, marginLeft: 16 }}
              >
                <Text
                  style={[
                    componentStyles.dropdownItemTextLabel,
                    { fontSize: SHORT_SCREEN ? 11 : 14 },
                  ]}
                >
                  {selectedPolicyAreas.length === POLICY_AREA_OPTIONS.length
                    ? "All selected"
                    : `${selectedPolicyAreas.length} selected`}
                </Text>
                {selectedPolicyAreas.length > 0 && (
                  <Pressable onPress={() => setSelectedPolicyAreas([])}>
                    <Text
                      style={[
                        componentStyles.dropdownItemTextLabel,
                        { fontSize: 14, color: "#008CFF" },
                      ]}
                    >
                      Clear
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            <ScrollView
              style={{ maxHeight: 260 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {/* All option */}
              <Pressable
                style={[
                  componentStyles.dropdownItem,
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                ]}
                onPress={() => togglePolicyArea("all")}
              >
                <Text style={componentStyles.dropdownItemText}>All</Text>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor:
                      selectedPolicyAreas.length === POLICY_AREA_OPTIONS.length
                        ? "#008CFF"
                        : "#7B7C81",
                    borderRadius: 4,
                    backgroundColor:
                      selectedPolicyAreas.length === POLICY_AREA_OPTIONS.length
                        ? "#008CFF"
                        : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedPolicyAreas.length ===
                    POLICY_AREA_OPTIONS.length && (
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        backgroundColor: "#008CFF",
                        borderRadius: 2,
                      }}
                    />
                  )}
                </View>
              </Pressable>

              {POLICY_AREA_OPTIONS.map((option) => {
                const isChecked = selectedPolicyAreas.includes(option.id);
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      componentStyles.dropdownItem,
                      {
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      },
                    ]}
                    onPress={() => togglePolicyArea(option.id)}
                  >
                    <Text style={[componentStyles.dropdownItemText, { flex: 1, fontSize: 13, marginRight: 8 }]}>
                      {option.label}
                    </Text>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderWidth: 2,
                        borderColor: isChecked ? "#008CFF" : "#7B7C81",
                        borderRadius: 4,
                        backgroundColor: isChecked ? "#008CFF" : "transparent",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {isChecked && (
                        <View
                          style={{
                            width: 12,
                            height: 12,
                            backgroundColor: "#008CFF",
                            borderRadius: 2,
                          }}
                        />
                      )}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Cancel / Save Buttons */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              paddingHorizontal: 16,
              marginBottom: 24,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                componentStyles.actionButton,
                { backgroundColor: "#fafafa" },
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              onPress={() => setShowOptionsModal(false)}
            >
              <Text
                style={{ color: "#535353", fontWeight: "500", fontSize: 16 }}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                componentStyles.actionButton,
                { backgroundColor: "#00AFFF" },
                pressed && { transform: [{ scale: 0.96 }] },
              ]}
              onPress={handleSavePolicyNotifs}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}
              >
                Save
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </Pressable>
    </Modal>
  );
}
