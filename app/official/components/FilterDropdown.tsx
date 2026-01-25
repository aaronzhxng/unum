import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

interface FilterDropdownProps {
  showTypeModal: boolean;
  showPolicyModal: boolean;
  selectedTypes: string[];
  selectedPolicies: string[];
  toggleType: (type: string) => void;
  togglePolicy: (policy: string) => void;
  setShowTypeModal: (show: boolean) => void;
  setShowPolicyModal: (show: boolean) => void;
  styles: any; // Pass your styles object
  onCancel: () => void;
  onApply: () => void;
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
  styles,
  onCancel,
  onApply,
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

                <Pressable
                  style={[
                    styles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => toggleType("Bills")}
                >
                  <Text style={styles.dropdownItemText}>Bills</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedTypes.includes("Bills")
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedTypes.includes("Bills") && (
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

                <Pressable
                  style={[
                    styles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => toggleType("Resolutions")}
                >
                  <Text style={styles.dropdownItemText}>Resolutions</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedTypes.includes("Resolutions")
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedTypes.includes("Resolutions") && (
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

                <Pressable
                  style={[
                    styles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => toggleType("Joint Resolutions")}
                >
                  <Text style={styles.dropdownItemText}>Joint Resolutions</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedTypes.includes(
                        "Joint Resolutions"
                      )
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedTypes.includes("Joint Resolutions") && (
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
              </View>

              {/* Policy Area Section */}
              <View style={[styles.dropdownMulti, { marginTop: 12 }]}>
                <Text style={styles.dropdownItemTextLabel}>Policy Area</Text>

                <Pressable
                  style={[
                    styles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => togglePolicy("Congress")}
                >
                  <Text style={styles.dropdownItemText}>Congress</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedPolicies.includes("Congress")
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedPolicies.includes("Congress") && (
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

                <Pressable
                  style={[
                    styles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => togglePolicy("Health")}
                >
                  <Text style={styles.dropdownItemText}>Health</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedPolicies.includes("Health")
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedPolicies.includes("Health") && (
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

                <Pressable
                  style={[
                    styles.dropdownItem,
                    {
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => togglePolicy("Gov Operations")}
                >
                  <Text style={styles.dropdownItemText}>Gov Operations</Text>
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 2,
                      borderColor: "#ccc",
                      borderRadius: 4,
                      backgroundColor: selectedPolicies.includes(
                        "Gov Operations"
                      )
                        ? "#008CFF"
                        : "transparent",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {selectedPolicies.includes("Gov Operations") && (
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
              </View>

              {/* Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                <Pressable
                  style={[styles.actionButton, { backgroundColor: "#f5f5f5" }]}
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
                  style={[styles.actionButton, { backgroundColor: "#00AFFF" }]}
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
