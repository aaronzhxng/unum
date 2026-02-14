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
}

const CHAMBER_OPTIONS: FilterOption[] = [
  { id: "house", label: "House" },
  { id: "senate", label: "Senate" },
];

const POLICY_AREA_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "agriculture", label: "Agriculture and Food" },
  { id: "animals", label: "Animals" },
  { id: "armed-forces", label: "Armed Forces and National Security" },
  { id: "arts", label: "Arts, Culture, Religion" },
  { id: "civil-rights", label: "Civil Rights and Liberties, Minority Issues" },
  { id: "commerce", label: "Commerce" },
  { id: "congress", label: "Congress" },
  { id: "crime", label: "Crime and Law Enforcement" },
  { id: "economics", label: "Economics and Public Finance" },
  { id: "education", label: "Education" },
  { id: "emergency", label: "Emergency Management" },
  { id: "energy", label: "Energy" },
  { id: "environmental", label: "Environmental Protection" },
  { id: "families", label: "Families" },
  { id: "finance", label: "Finance and Financial Sector" },
  { id: "foreign-trade", label: "Foreign Trade and International Finance" },
  { id: "government", label: "Government Operations and Politics" },
  { id: "health", label: "Health" },
  { id: "housing", label: "Housing and Community Development" },
  { id: "immigration", label: "Immigration" },
  { id: "international", label: "International Affairs" },
  { id: "labor", label: "Labor and Employment" },
  { id: "law", label: "Law" },
  { id: "native-americans", label: "Native Americans" },
  { id: "public-lands", label: "Public Lands and Natural Resources" },
  { id: "science", label: "Science, Technology, Communications" },
  { id: "social-welfare", label: "Social Welfare" },
  { id: "sports", label: "Sports and Recreation" },
  { id: "taxation", label: "Taxation" },
  { id: "transportation", label: "Transportation and Public Works" },
  { id: "water", label: "Water Resources Development" },
];
const LEGISLATION_TYPE_OPTIONS: FilterOption[] = [
  { id: "all", label: "All" },
  { id: "house_bill", label: "House Bills" },
  { id: "senate_bill", label: "Senate Bills" },
  { id: "house_amdt", label: "House Amendment" },
  { id: "senate_amdt", label: "Senate Amendment" },
  { id: "house_joint_resolution", label: "House Joint Resolution" },
  { id: "senate_joint_resolution", label: "Senate Joint Resolution" },
  { id: "house_con_res", label: "House Concurrent Resolution" },
  { id: "senate_con_res", label: "Senate Concurrent Resolution" },
  { id: "house_res", label: "House Resolution" },
  { id: "senate_res", label: "Senate Resolution" },
  { id: "nominations", label: "Nominations" },
  { id: "treaty_doc", label: "Treaty Document" },
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
}: LegislationFilterModalProps) {
  const handleCancel = () => {
    onCancel();
    onClose();
  };

  const handleApply = () => {
    onApply();
    onClose();
  };

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
            <Text style={componentStyles.dropdownItemTextLabel}>
              Chamber of Congress
            </Text>
            {CHAMBER_OPTIONS.map((option) => (
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
                onPress={() => toggleChamber(option.id)}
              >
                <Text style={componentStyles.dropdownItemText}>
                  {option.label}
                </Text>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderWidth: 2,
                    borderColor: selectedChambers.includes(option.id)
                      ? "#008CFF"
                      : "#7B7C81",
                    borderRadius: 4,
                    backgroundColor: selectedChambers.includes(option.id)
                      ? "#008CFF"
                      : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {selectedChambers.includes(option.id) && (
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
            ))}
          </View>

          {/* Policy Area */}
          <View
            style={[
              componentStyles.dropdownMulti,
              { marginTop: 12, height: 200 },
            ]}
          >
            <Text style={componentStyles.dropdownItemTextLabel}>
              Policy Area
            </Text>
            <ScrollView
              style={{ maxHeight: 200 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {POLICY_AREA_OPTIONS.map((option) => (
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
                  <Text style={componentStyles.dropdownItemText}>
                    {option.label}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: selectedPolicyAreas.includes(option.id)
                        ? "#008CFF"
                        : "#7B7C81",
                      borderRadius: 4,
                      backgroundColor: selectedPolicyAreas.includes(option.id)
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedPolicyAreas.includes(option.id) && (
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
              ))}
            </ScrollView>
          </View>

          {/* Legislation Type */}
          <View
            style={[
              componentStyles.dropdownMulti,
              { marginTop: 12, height: 200 },
            ]}
          >
            <Text style={componentStyles.dropdownItemTextLabel}>
              Legislation Type
            </Text>
            <ScrollView
              style={{ maxHeight: 200 }}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
            >
              {LEGISLATION_TYPE_OPTIONS.map((option) => (
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
                  onPress={() => toggleLegislationType(option.id)}
                >
                  <Text style={componentStyles.dropdownItemText}>
                    {option.label}
                  </Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: selectedLegislationTypes.includes(option.id)
                        ? "#008CFF"
                        : "#7B7C81",
                      borderRadius: 4,
                      backgroundColor: selectedLegislationTypes.includes(
                        option.id,
                      )
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedLegislationTypes.includes(option.id) && (
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
              ))}
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
                Results
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
