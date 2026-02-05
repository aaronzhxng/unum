import { ChevronDown, ChevronUp } from "lucide-react-native";
import React from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { styles as componentStyles } from "../styles/components"; // adjust path if needed

type Party = "D" | "R" | "I";

export interface Cosponsor {
  id: string;
  name: string;
  party: Party | string;
  role: string; // e.g., "Senator, Louisiana"
  avatar: any; // require(...) as in home.tsx
  update?: string; // optional tag like "Original cosponsor"
}

interface CosponsorsProps {
  cosponsors: Cosponsor[];

  // Filter/sort state from parent
  showCosponsorFilter: boolean;
  setShowCosponsorFilter: (show: boolean) => void;
  showCosponsorSort: boolean;
  setShowCosponsorSort: (show: boolean) => void;
  selectedCosponsorSort: string;

  // Reuse modals from parent
  setShowChamberModal: (show: boolean) => void;
  setShowPartyModal: (show: boolean) => void;
}

const Cosponsors: React.FC<CosponsorsProps> = ({
  cosponsors,
  showCosponsorFilter,
  setShowCosponsorFilter,
  showCosponsorSort,
  setShowCosponsorSort,
  selectedCosponsorSort,
  setShowChamberModal,
  setShowPartyModal,
}) => {
  const sortedCosponsors = React.useMemo(() => {
    const copy = [...cosponsors];
    switch (selectedCosponsorSort) {
      case "A-Z":
        return copy.sort((a, b) => a.name.localeCompare(b.name));
      case "Z-A":
        return copy.sort((a, b) => b.name.localeCompare(a.name));
      case "Newest First":
        return copy.sort(
          (a, b) =>
            new Date(
              (b.update || "").match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] ||
                "1/1/1970",
            ).getTime() -
            new Date(
              (a.update || "").match(/\d{1,2}\/\d{1,2}\/\d{4}/)?.[0] ||
                "1/1/1970",
            ).getTime(),
        );
      case "Oldest First": /* reverse above */
      default:
        return copy;
    }
  }, [cosponsors, selectedCosponsorSort]);

  const renderItem = ({ item }: { item: Cosponsor }) => (
    <View style={componentStyles.officialCard}>
      <Image source={item.avatar} style={componentStyles.avatar} />
      <View style={componentStyles.cardText}>
        <Text style={componentStyles.name}>{item.name}</Text>
        <View style={componentStyles.metaRow}>
          <Text style={componentStyles.subtitle}>{item.party}</Text>
          <Text style={componentStyles.separator}>·</Text>
          <Text style={componentStyles.subtitle}>{item.role}</Text>
          {item.update ? (
            <>
              <Text style={componentStyles.separator}>·</Text>
              <Text style={componentStyles.update}>{item.update}</Text>
            </>
          ) : null}
        </View>
        <View style={componentStyles.metaRow}></View>
      </View>
    </View>
  );

  return (
    <View>
      {/* Top row: filter on left, sort on right (like Actions) */}
      <View
        style={[
          componentStyles.sectionHeader,
          {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: -8,
          },
        ]}
      >
        {/* Left: Filter trigger */}
        <Pressable
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            flex: 1,
          }}
          onPress={() => {
            setShowChamberModal(true);
            setShowPartyModal(true);
            setShowCosponsorFilter(true);
          }}
        >
          <Text
            style={[
              componentStyles.detailTitle,
              { lineHeight: 16, fontSize: 16, fontWeight: 600 },
            ]}
          >
            Cosponsors ({cosponsors.length})
          </Text>
          {showCosponsorFilter ? (
            <ChevronUp size={16} color="#7B7C81" />
          ) : (
            <ChevronDown size={16} color="#7B7C81" />
          )}
        </Pressable>

        {/* Right: Sort button */}
        <Pressable
          style={[componentStyles.sortButton, { marginRight: -12 }]}
          onPress={(e) => {
            e.stopPropagation();
            setShowCosponsorSort(!showCosponsorSort);
          }}
        >
          <Text style={componentStyles.viewAll}>{selectedCosponsorSort}</Text>
          {showCosponsorSort ? (
            <ChevronUp size={16} color="#7B7C81" />
          ) : (
            <ChevronDown size={16} color="#7B7C81" />
          )}
        </Pressable>
      </View>

      {/* List of cosponsor cards */}
      <FlatList
        data={sortedCosponsors}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={componentStyles.legislationContainer}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Cosponsors;
