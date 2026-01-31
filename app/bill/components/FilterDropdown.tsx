import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/components";

interface FilterOption {
  id: string;
  label: string;
}

interface FilterDropdownProps {
  showChamberModal: boolean;
  showPartyModal: boolean;
  selectedChamber: string[];
  selectedPolicies: string[];
  toggleChamber: (id: string) => void;
  toggleParty: (id: string) => void;
  setShowChamberModal: (show: boolean) => void;
  setShowPartyModal: (show: boolean) => void;
  onCancel: () => void;
  onApply: () => void;
  chamber: FilterOption[];
  party: FilterOption[];
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  showChamberModal,
  showPartyModal,
  selectedChamber,
  selectedPolicies,
  toggleChamber,
  toggleParty,
  setShowChamberModal,
  setShowPartyModal,
  onCancel,
  onApply,
  chamber,
  party,
}) => {
  const closeModals = () => {
    setShowChamberModal(false);
    setShowPartyModal(false);
  };

  return (
    <>
      {(showChamberModal || showPartyModal) && (
        <Modal
          transparent={true}
          animationType="fade"
          statusBarTranslucent={true}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => {
              setShowChamberModal(false);
              setShowPartyModal(false);
            }}
          >
            <View style={[{ padding: 0, minHeight: 400 }]}>
              {/* Legislation Type Section */}
              <View style={styles.dropdownMulti}>
                <Text style={styles.dropdownItemTextLabel}>
                  Chamber of Origin
                </Text>
                <ScrollView
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {chamber.map((option) => (
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
                      onPress={() => toggleChamber(option.id)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {option.label}
                      </Text>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 2,
                          borderColor: "#ccc",
                          borderRadius: 4,
                          backgroundColor: selectedChamber.includes(option.id)
                            ? "#008CFF"
                            : "transparent",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {selectedChamber.includes(option.id) && (
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

              {/* Party of Origin Section */}
              <View style={[styles.dropdownMulti, { marginTop: 12 }]}>
                <Text style={styles.dropdownItemTextLabel}>
                  Party of Origin
                </Text>
                <ScrollView
                  style={{ maxHeight: 200 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {party.map((option) => (
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
                      onPress={() => toggleParty(option.id)}
                    >
                      <Text style={styles.dropdownItemText}>
                        {option.label}
                      </Text>
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderWidth: 2,
                          borderColor: "#ccc",
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
