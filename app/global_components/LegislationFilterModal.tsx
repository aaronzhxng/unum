import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface FilterOption {
  id: string;
  label: string;
}

interface LegislationFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedChambers: string[];
  selectedPolicyAreas: string[];
  selectedLegislationTypes: string[];
  toggleChamber: (id: string) => void;
  togglePolicyArea: (id: string) => void;
  toggleLegislationType: (id: string) => void;
  onCancel: () => void;
  onApply: () => void;
  // Add these new props
  setSelectedChambers: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedPolicyAreas: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLegislationTypes: React.Dispatch<React.SetStateAction<string[]>>;
  resultCount: number;
}

const CHAMBER_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "house", label: "House" },
  { id: "senate", label: "Senate" },
];

const POLICY_AREA_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "none", label: "No Policy Area" },
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

const LEGISLATION_TYPE_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "bill", label: "Bills" },
  { id: "joint_resolution", label: "Joint Resolutions" },
  { id: "concurrent_resolution", label: "Concurrent Resolutions" },
  { id: "resolution", label: "Simple Resolutions" },
  { id: "amendment", label: "Amendments" },
  { id: "nomination", label: "Nominations" },
  { id: "treaty", label: "Treaty Documents" },
];

export default function LegislationFilterModal({
  visible,
  onClose,
  selectedChambers,
  selectedPolicyAreas,
  selectedLegislationTypes,
  toggleChamber,
  togglePolicyArea,
  toggleLegislationType,
  onCancel,
  onApply,
  setSelectedChambers,
  setSelectedPolicyAreas,
  setSelectedLegislationTypes,
  resultCount,
}: LegislationFilterModalProps) {
  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

  const nonAllChambers = CHAMBER_OPTIONS.filter((o) => o.id !== "all");
  const nonAllPolicyAreas = POLICY_AREA_OPTIONS.filter((o) => o.id !== "all");
  const nonAllLegislationTypes = LEGISLATION_TYPE_OPTIONS.filter(
    (o) => o.id !== "all",
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={componentStyles.modalOverlay} onPress={onClose}>
        <View style={{ padding: 0, minHeight: 200, marginTop: -200 }}>
          {/* Chamber of Congress */}
          <View style={componentStyles.dropdownMulti}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 16,
                marginBottom: 8,
              }}
            >
              <Text style={componentStyles.dropdownItemTextLabel}>
                Chamber of Congress
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 24 }}
              >
                <Text
                  style={[
                    componentStyles.dropdownItemTextLabel,
                    { fontSize: 14, marginLeft: 48 },
                  ]}
                >
                  {selectedChambers.length === nonAllChambers.length
                    ? "All selected"
                    : `${selectedChambers.length} selected`}
                </Text>
                {selectedChambers.length > 0 && (
                  <Pressable onPress={() => setSelectedChambers([])}>
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

            {CHAMBER_OPTIONS.map((option) => {
              const isAllOption = option.id === "all";
              const allSelected =
                selectedChambers.length === nonAllChambers.length;
              const isChecked = isAllOption
                ? allSelected
                : selectedChambers.includes(option.id);

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
                  onPress={() => {
                    if (isAllOption) {
                      if (allSelected) {
                        setSelectedChambers([]);
                      } else {
                        setSelectedChambers(nonAllChambers.map((o) => o.id));
                      }
                    } else {
                      toggleChamber(option.id);
                    }
                  }}
                >
                  <Text style={componentStyles.dropdownItemText}>
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
          </View>

          {/* Policy Area */}
          <View
            style={[
              componentStyles.dropdownMulti,
              { marginTop: 12, height: 200 },
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
              <Text style={componentStyles.dropdownItemTextLabel}>
                Policy Area
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 24 }}
              >
                <Text
                  style={[
                    componentStyles.dropdownItemTextLabel,
                    { fontSize: 14, marginLeft: 48 },
                  ]}
                >
                  {" "}
                  {selectedPolicyAreas.length === nonAllPolicyAreas.length
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
              style={{ maxHeight: 200 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {POLICY_AREA_OPTIONS.map((option) => {
                const isAllOption = option.id === "all";
                const allSelected =
                  selectedPolicyAreas.length === nonAllPolicyAreas.length;
                const isChecked = isAllOption
                  ? allSelected
                  : selectedPolicyAreas.includes(option.id);

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
                    onPress={() => {
                      if (isAllOption) {
                        if (allSelected) {
                          setSelectedPolicyAreas([]);
                        } else {
                          setSelectedPolicyAreas(
                            nonAllPolicyAreas.map((o) => o.id),
                          );
                        }
                      } else {
                        togglePolicyArea(option.id);
                      }
                    }}
                  >
                    <Text style={componentStyles.dropdownItemText}>
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

          {/* Legislation Type */}
          <View
            style={[
              componentStyles.dropdownMulti,
              { marginTop: 12, height: 200 },
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
              <Text style={componentStyles.dropdownItemTextLabel}>
                Legislation Type
              </Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 24 }}
              >
                <Text
                  style={[
                    componentStyles.dropdownItemTextLabel,
                    { fontSize: 14, paddingRight: 0 },
                  ]}
                >
                  {" "}
                  {selectedLegislationTypes.length ===
                  nonAllLegislationTypes.length
                    ? "All selected"
                    : `${selectedLegislationTypes.length} selected`}
                </Text>
                {selectedLegislationTypes.length > 0 && (
                  <Pressable onPress={() => setSelectedLegislationTypes([])}>
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
              style={{ maxHeight: 200 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {LEGISLATION_TYPE_OPTIONS.map((option) => {
                const isAllOption = option.id === "all";
                const allSelected =
                  selectedLegislationTypes.length ===
                  nonAllLegislationTypes.length;
                const isChecked = isAllOption
                  ? allSelected
                  : selectedLegislationTypes.includes(option.id);

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
                    onPress={() => {
                      if (isAllOption) {
                        if (allSelected) {
                          setSelectedLegislationTypes([]);
                        } else {
                          setSelectedLegislationTypes(
                            nonAllLegislationTypes.map((o) => o.id),
                          );
                        }
                      } else {
                        toggleLegislationType(option.id);
                      }
                    }}
                  >
                    <Text style={componentStyles.dropdownItemText}>
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

          {/* Cancel / Results Buttons */}
          <View
            style={{ flexDirection: "row", gap: 12, paddingHorizontal: 16 }}
          >
            <Pressable
              style={({ pressed }) => [
                componentStyles.actionButton,
                { backgroundColor: "#fafafa" },
                { transform: pressed ? [{ scale: 0.96 }] : [] },
              ]}
              onPress={handleCancel}
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
                { transform: pressed ? [{ scale: 0.96 }] : [] },
              ]}
              onPress={handleApply}
            >
              <Text
                style={{ color: "#FFFFFF", fontWeight: "500", fontSize: 16 }}
              >
                {resultCount} {resultCount === 1 ? "Result" : "Results"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
