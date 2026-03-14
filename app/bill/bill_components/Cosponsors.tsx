import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import LoadingSpinner from "../../global_components/LoadingSpinner";
import { styles as componentStyles } from "../styles"; // adjust path if needed
import FilterDropdown from "./FilterDropdown"; // Adjust path

type Party = "D" | "R" | "I";

export interface Cosponsor {
  id: string;
  name: string;
  party: Party;
  role: string;
  photoUrl?: string; // ← URI string instead of avatar
  avatar?: any; // ← keep for backwards compatibility
  update?: string;
}

interface CosponsorsProps {
  cosponsors: Cosponsor[];
  isLoading?: boolean; // ← add this
  showCosponsorFilter: boolean;
  setShowCosponsorFilter: (show: boolean) => void;
  showCosponsorSort: boolean;
  setShowCosponsorSort: (show: boolean) => void;
  selectedCosponsorSort: string;
  selectedRole: string[];
  setSelectedRole: React.Dispatch<React.SetStateAction<string[]>>;
  showCosponsorChamberModal: boolean;
  showCosponsorPartyModal: boolean;
  setShowCosponsorChamberModal: (show: boolean) => void;
  setShowCosponsorPartyModal: (show: boolean) => void;
  selectedParty: string[];
  setSelectedParty: React.Dispatch<React.SetStateAction<string[]>>;
}

interface FilterOption {
  id: string;
  label: string;
}

const Cosponsors: React.FC<CosponsorsProps> = ({
  cosponsors,
  isLoading,
  showCosponsorFilter,
  setShowCosponsorFilter,
  showCosponsorSort,
  setShowCosponsorSort,
  selectedCosponsorSort,
  showCosponsorChamberModal,
  showCosponsorPartyModal,
  setShowCosponsorChamberModal,
  setShowCosponsorPartyModal,
  selectedRole,
  setSelectedRole,
  selectedParty,
  setSelectedParty,
}) => {
  const roleOptions: FilterOption[] = [
    { id: "representative", label: "Representative" },
    { id: "senator", label: "Senator" },
  ];

  const partyOptions: FilterOption[] = [
    { id: "D", label: "Democrat" },
    { id: "R", label: "Republican" },
    { id: "I", label: "Independent" },
  ];

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
            (b.update ? new Date(b.update).getTime() : 0) -
            (a.update ? new Date(a.update).getTime() : 0),
        );
      case "Oldest First":
        return copy.sort(
          (a, b) =>
            (a.update ? new Date(a.update).getTime() : 0) -
            (b.update ? new Date(b.update).getTime() : 0),
        );
      default:
        return copy;
    }
  }, [cosponsors, selectedCosponsorSort]);

  const toggleRole = (id: string) => {
    setSelectedRole((prev) =>
      prev.includes(id) ? prev.filter((role) => role !== id) : [...prev, id],
    );
  };

  const filteredCosponsors = sortedCosponsors.filter((cosponsor) => {
    const roleMatch =
      !selectedRole?.length ||
      selectedRole.some((role) => cosponsor.role?.toLowerCase().includes(role));

    const partyMatch =
      !selectedParty?.length ||
      (cosponsor.party && selectedParty.includes(cosponsor.party));

    return roleMatch && partyMatch;
  });

  const togglePartyFilter = (id: string) => {
    setSelectedParty((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  };

  // const [selectedParty, setSelectedParty] = useState<string[]>([]);

  const CosponsorCard = ({ item }: { item: Cosponsor }) => {
    const [imageError, setImageError] = useState(false);
    const router = useRouter();

    return (
      <Pressable
        onPress={() => router.navigate(`/official/${item.id}`)}
        style={({ pressed }) => ({
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <View style={componentStyles.officialCard}>
          <View style={componentStyles.avatar}>
            {item.photoUrl && !imageError ? (
              <Image
                source={{ uri: item.photoUrl }}
                style={{ width: "100%", height: "120%" }}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#BFBFBF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 24, fontWeight: "bold" }}
                >
                  {item.name?.charAt(0) || "?"}
                </Text>
              </View>
            )}
          </View>
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
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          Loading cosponsor data...
        </Text>
      </View>
    );
  }

  if (!cosponsors || cosponsors.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <Text style={{ color: "#7B7C81" }}>No cosponsors for this bill.</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Top row: filter on left, sort on right */}
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
        {/* Left: Filter trigger - BULLETPROOF VERSION */}
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
          onPress={(e) => {
            e.stopPropagation(); // Block parent events
            e.preventDefault(); // Block default behaviors
            const willExpand = !showCosponsorFilter;
            setShowCosponsorFilter(willExpand);
            if (willExpand) {
              setShowCosponsorChamberModal(true); // Cosponsor role modal
              setShowCosponsorPartyModal(false);
            }
          }}
        >
          <Text
            style={[
              componentStyles.detailTitle,
              { lineHeight: 16, fontSize: 16, fontWeight: "600" },
            ]}
          >
            Cosponsors ({filteredCosponsors.length})
          </Text>
          {showCosponsorFilter ? (
            <ChevronUp size={16} color="#7B7C81" />
          ) : (
            <ChevronDown size={16} color="#7B7C81" />
          )}
        </Pressable>

        {/* Right: Sort button */}
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

      {/* FilterDropdown for Cosponsors */}
      {showCosponsorFilter && (
        <FilterDropdown
          showChamberModal={showCosponsorChamberModal}
          showPartyModal={showCosponsorPartyModal}
          setShowChamberModal={setShowCosponsorChamberModal}
          setShowPartyModal={setShowCosponsorPartyModal}
          selectedChamber={selectedRole} // Role checkboxes
          selectedPolicies={selectedParty} // NEW: Party checkboxes
          toggleChamber={toggleRole} // Role toggle ✅ working
          toggleParty={togglePartyFilter} // NEW: Party toggle ✅ fixes blue
          chamber={roleOptions}
          party={partyOptions}
          showOnlyChamber={false} // Shows party section
          chamberLabelOverride="Role"
          marginTopOverride={0}
          onFilterClose={() => setShowCosponsorFilter(false)}
          onCancel={() => {
            setSelectedRole([]);
            setSelectedParty([]); // NEW: Reset party
            setShowCosponsorChamberModal(false);
            setShowCosponsorPartyModal(false);
          }}
          onApply={() => {
            setShowCosponsorChamberModal(false);
            setShowCosponsorPartyModal(false);
          }}
        />
      )}

      {/* List of cosponsor cards */}
      <FlatList
        data={filteredCosponsors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CosponsorCard item={item} />}
        contentContainerStyle={componentStyles.legislationContainer}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Cosponsors;
