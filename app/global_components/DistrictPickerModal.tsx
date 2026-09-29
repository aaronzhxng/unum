import { Search, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { geocodeAddressToDistrict } from "../services/censusGeocoding";
import CongressionalDistrictMap, {
    type DistrictSelection,
    type FocusDistrict,
    type PinLocation,
} from "./CongressionalDistrictMap";

export type PickerRep = {
  bioguideId: string;
  name: string;
  party: string;
  role: string;
  photoUrl: string;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  // Districts the user's zip code overlaps; highlighted on the map
  focusDistricts: FocusDistrict[];
  stateAbbr: string | null;
  resolveRep: (stateAbbr: string, district: number) => PickerRep | null;
  onConfirm: (rep: PickerRep) => void;
};

const PARTY_ABBR: Record<string, string> = {
  Democratic: "D",
  Republican: "R",
  Independent: "I",
  Democrat: "D",
};

// Onboarding flow for zip codes that span several districts: the user taps
// their district on the map (or enters a street address) and confirms the rep.
export default function DistrictPickerModal({
  visible,
  onClose,
  focusDistricts,
  stateAbbr,
  resolveRep,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<DistrictSelection | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [addressSearching, setAddressSearching] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [pinLocation, setPinLocation] = useState<PinLocation | null>(null);
  const [addressGeoid, setAddressGeoid] = useState<string | null>(null);

  // Fresh start each time the picker opens
  useEffect(() => {
    if (!visible) return;
    setSelected(null);
    setAddressError(null);
    setPinLocation(null);
    setAddressGeoid(null);
  }, [visible]);

  const handleSelectDistrict = useCallback((district: DistrictSelection) => {
    setSelected(district);
  }, []);

  const handleAddressSearch = async () => {
    const trimmed = addressQuery.trim();
    if (!trimmed) return;

    setAddressSearching(true);
    setAddressError(null);

    try {
      const result = await geocodeAddressToDistrict(trimmed);
      if (!result) {
        setAddressError(
          "Couldn't find that address. Try including the city and state.",
        );
        return;
      }
      setPinLocation({
        latitude: result.latitude,
        longitude: result.longitude,
      });
      setAddressGeoid(result.geoid);
      setSelected({
        geoid: result.geoid,
        stateAbbr: result.stateAbbr,
        district: result.district,
        label: result.matchedAddress,
      });
    } catch (error) {
      console.error("Address lookup failed:", error);
      setAddressError("Couldn't look up that address. Please try again.");
    } finally {
      setAddressSearching(false);
    }
  };

  const selectedRep = selected
    ? resolveRep(selected.stateAbbr, selected.district)
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#fafafa" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#1a1a1a",
                marginBottom: 8,
              }}
            >
              Find your district
            </Text>
            <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
              Your zip code spans {focusDistricts.length} districts. Tap the
              one you live in, or enter your street address for an exact match.
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={({ pressed }) => ({
              marginTop: 4,
              transform: [{ scale: pressed ? 0.85 : 1 }],
            })}
          >
            <X size={28} color="#535353" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: insets.bottom + 48,
            gap: 12,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#fff",
              borderRadius: 16,
              paddingHorizontal: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Search size={18} color="#7B7C81" />
            <TextInput
              value={addressQuery}
              onChangeText={(text) => {
                setAddressQuery(text);
                if (addressError) setAddressError(null);
              }}
              onSubmitEditing={handleAddressSearch}
              placeholder="Street address (optional)"
              placeholderTextColor="#aaa"
              returnKeyType="search"
              style={{
                flex: 1,
                paddingVertical: 16,
                paddingHorizontal: 10,
                fontSize: 16,
                color: "#1a1a1a",
              }}
            />
            {addressSearching ? (
              <ActivityIndicator color="#008CFF" />
            ) : (
              <Pressable
                onPress={handleAddressSearch}
                disabled={!addressQuery.trim()}
                style={({ pressed }) => ({
                  backgroundColor: addressQuery.trim() ? "#008CFF" : "#d0d0d0",
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>
                  Find
                </Text>
              </Pressable>
            )}
          </View>
          {addressError && (
            <Text
              style={{ fontSize: 13, color: "#D45252", paddingHorizontal: 4 }}
            >
              {addressError}
            </Text>
          )}

          <CongressionalDistrictMap
            stateAbbr={stateAbbr}
            onSelectDistrict={handleSelectDistrict}
            focusDistricts={focusDistricts}
            autoSelectFocus={false}
            selectedGeoid={addressGeoid}
            pinLocation={pinLocation}
          />

          {selected && !selectedRep && (
            <View
              style={{
                backgroundColor: "#FFF8E7",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#F5A623",
              }}
            >
              <Text style={{ fontSize: 13, color: "#8B6914", lineHeight: 18 }}>
                Couldn't find a representative for this district in our
                database.
              </Text>
            </View>
          )}

          {selectedRep && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 24,
                padding: 14,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    overflow: "hidden",
                    backgroundColor: "#eee",
                    marginRight: 12,
                  }}
                >
                  <Image
                    source={{ uri: selectedRep.photoUrl }}
                    style={{ width: "100%", height: "120%" }}
                    resizeMode="cover"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "600", color: "#535353" }}
                  >
                    {selectedRep.name}
                  </Text>
                  <Text
                    style={{ fontSize: 13, color: "#7B7C81", marginTop: 2 }}
                    numberOfLines={1}
                  >
                    {PARTY_ABBR[selectedRep.party] ?? selectedRep.party} ·{" "}
                    {selectedRep.role}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => onConfirm(selectedRep)}
                style={({ pressed }) => ({
                  marginTop: 12,
                  backgroundColor: "#008CFF",
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>
                  This is my representative
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
