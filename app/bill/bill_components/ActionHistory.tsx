import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { useWrapped } from "../../utils/useWrapped";
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
  const { wrapped: sortWrapped, onFirstLayout, onSecondLayout } = useWrapped();
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
            // The sort drops below the title when they don't fit side by side
            flexWrap: "wrap",
            columnGap: 12,
          },
        ]}
      >
        {/* Left: Title with count + filter button */}
        <Pressable
          onLayout={onFirstLayout}
          style={({ pressed }) => ({
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            flexShrink: 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
          onPress={() => {
            setShowChamberModal(true);
            setShowPartyModal(false);
          }}
        >
          <Text
            style={[
              componentStyles.detailTitle,
              { fontSize: 16, fontWeight: 600, flexShrink: 1 },
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

        {/* Center: Sort button */}
        <Pressable
          style={({ pressed }) => [
            componentStyles.button,
            // Its padding lines its text up with the edge it sits against
            sortWrapped
              ? { marginLeft: -12, marginTop: 4 }
              : { marginRight: -12 },
            {
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          onLayout={onSecondLayout}
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
