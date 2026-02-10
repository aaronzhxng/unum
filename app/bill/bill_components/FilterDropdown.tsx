import React from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { styles } from "../styles";

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
  onCancel?: () => void;
  onApply?: () => void;
  chamber: FilterOption[];
  party: FilterOption[];
  showOnlyChamber?: boolean;
  onFilterClose?: () => void;
  chamberLabelOverride?: string;
  marginTopOverride?: number;
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
  showOnlyChamber = false,
  chamberLabelOverride,
  onFilterClose,
  marginTopOverride,
}) => {
  const modalMarginTop =
    marginTopOverride !== undefined
      ? marginTopOverride
      : showPartyModal
        ? 0
        : 120;
  const closeModals = () => {
    setShowChamberModal(false);
    setShowPartyModal(false);
    onFilterClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    closeModals();
  };

  const handleApply = () => {
    onApply?.();
    closeModals();
  };

  const chamberLabel =
    chamberLabelOverride ?? (showOnlyChamber ? "Role" : "Chamber of Origin");

  return (
    (showChamberModal || showPartyModal) && (
      <Modal
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={closeModals}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModals}>
          <View
            style={{
              padding: 0,
              minHeight: 400,
              marginTop: modalMarginTop,
            }}
          >
            {/* First Section: Role/Chamber */}
            <View style={styles.dropdownMulti}>
              <Text style={styles.dropdownItemTextLabel}>{chamberLabel}</Text>
              {/* Dynamic label */}
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
                    <Text style={styles.dropdownItemText}>{option.label}</Text>
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderWidth: 2,
                        borderColor: "#7B7C81",
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

            {/* Party Section: Hidden for Cosponsors */}
            {showOnlyChamber !== true && (
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
            )}

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: "#f5f5f5" },
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
                  styles.actionButton,
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
    )
  );
};

export default FilterDropdown;
