import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterDropdownProps {
  showTypeModal: boolean;
  showPolicyModal: boolean;
  selectedTypes: string[];
  selectedPolicies: string[];
  toggleType: (id: string) => void;
  togglePolicy: (id: string) => void;
  setShowTypeModal: (show: boolean) => void;
  setShowPolicyModal: (show: boolean) => void;
  onCancel: () => void;
  onApply: () => void;
  legislationTypes: FilterOption[];
  policyAreas: FilterOption[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  showTypeModal,
  showPolicyModal,
  selectedTypes,
  selectedPolicies,
  toggleType,
  togglePolicy,
  setShowTypeModal,
  setShowPolicyModal,
  onCancel,
  onApply,
  legislationTypes,
  policyAreas,
}) => {
  const closeModals = () => {
    setShowTypeModal(false);
    setShowPolicyModal(false);
  };

  return (
    <>
      {(showTypeModal || showPolicyModal) && (
        <Modal
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setShowTypeModal(false);
              setShowPolicyModal(false);
            }}
          >
            <View style={[{ padding: 0, minHeight: 400 }]}>
              {/* Legislation Type Section */}
              <View style={styles.dropdownMulti}>
                <Text style={styles.dropdownItemTextLabel}>
                  Legislation Type
                </Text>
                <ScrollView
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {legislationTypes.map((option) => (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.dropdownItem,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => toggleType(option.id)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {option.label}
                      </Text>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 2,
                          borderColor: "#7B7C81",
                          borderRadius: 4,
                          backgroundColor: selectedTypes.includes(option.id)
                            ? "#008CFF"
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {selectedTypes.includes(option.id) && (
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

              {/* Policy Area Section */}
              <View style={[styles.dropdownMulti, { marginTop: 12 }]}>
                <Text style={styles.dropdownItemTextLabel}>Policy Area</Text>
                <ScrollView
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {policyAreas.map((option) => (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.dropdownItem,
                        {
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        },
                      ]}
                      onPress={() => togglePolicy(option.id)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {option.label}
                      </Text>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 2,
                          borderColor: "#7B7C81",
                          borderRadius: 4,
                          backgroundColor: selectedPolicies.includes(option.id)
                            ? "#008CFF"
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {selectedPolicies.includes(option.id) && (
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

              {/* Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: "#f5f5f5" },
                    {
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                  onPress={onCancel}
                >
                  <Text
                    style={[
                      { color: "#535353", fontWeight: 500, fontSize: 16 },
                    ]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: "#00AFFF" },
                    {
                      transform: [{ scale: pressed ? 0.96 : 1 }],
                    },
                  ]}
                  onPress={onApply}
                >
                  <Text
                    style={[
                      { color: "#FFFFFF", fontWeight: 500, fontSize: 16 },
                    ]}
                  >
                    Results
                  </Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}
    </>
  );
};

export default FilterDropdown;
