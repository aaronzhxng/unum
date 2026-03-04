import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../styles"; // Adjust path

interface Action {
  date: string;
  chamber: string;
  description: string;
}

interface ActionHistoryProps {
  actions: Action[];
  selectedSort: string;
  showSort: boolean;
  setShowSort: (show: boolean) => void;
  showChamberModal: boolean;
  showPartyModal: boolean;
  setShowChamberModal: (show: boolean) => void;
  setShowPartyModal: (show: boolean) => void;
  showOnlyChamber?: boolean;
  chamberLabelOverride?: string;
}

const ActionHistory: React.FC<ActionHistoryProps> = ({
  actions,
  selectedSort,
  showSort,
  setShowSort,
  showChamberModal,
  showPartyModal,
  setShowChamberModal,
  setShowPartyModal,
}) => {
  return (
    <View
      style={{
        marginTop: -8,
        marginBottom: 96,
        marginHorizontal: 16,
      }}
    >
      <Pressable
        style={[
          componentStyles.sectionHeader,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          },
        ]}
      >
        {/* Left: Title with count + filter button */}
        <View style={{ flex: 1 }}>
          <View
            style={{
              alignSelf: "flex-start",
              height: 20,
            }}
          >
            <Pressable
              style={({ pressed }) => [
                {
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  flex: 1,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                },
              ]}
              onPress={() => {
                setShowChamberModal(true);
                setShowPartyModal(false);
              }}
            >
              <Text
                style={[
                  componentStyles.detailTitle,
                  { fontSize: 16, fontWeight: 600, lineHeight: 16 },
                ]}
              >
                Total actions ({actions.length})
              </Text>
              {showChamberModal || showPartyModal ? (
                <ChevronUp size={16} color="#7B7C81" />
              ) : (
                <ChevronDown size={16} color="#7B7C81" />
              )}
            </Pressable>
          </View>
        </View>

        {/* Center: Sort button */}
        <Pressable
          style={({ pressed }) => [
            componentStyles.button,
            { marginRight: -12 },
            {
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          onPress={(e) => {
            e.stopPropagation();
            setShowSort(!showSort);
          }}
        >
          <Text style={componentStyles.viewAll}>{selectedSort}</Text>
          {showSort ? (
            <ChevronUp size={16} color="#7B7C81" />
          ) : (
            <ChevronDown size={16} color="#7B7C81" />
          )}
        </Pressable>
      </Pressable>

      {/* Always-visible list */}
      <View style={componentStyles.expandedAmendments}>
        {actions.map((action, index) => (
          <View key={index} style={componentStyles.amendmentItem}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "space-between", // ADD THIS
                gap: 8,
              }}
            >
              <Text style={componentStyles.detailInfo}>{action.date}</Text>
              <Text style={componentStyles.detailInfo}>{action.chamber}</Text>
            </View>
            <Text style={componentStyles.amendmentSummary}>
              {action.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default ActionHistory;
