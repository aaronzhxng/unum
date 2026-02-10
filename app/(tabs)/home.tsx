import { useRouter } from "expo-router";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import ListSelection from "../global_components/ListSelection";
import OptionsModal from "../global_components/OptionsModal";
import SearchModal from "../global_components/SearchModal";
import { styles as componentStyles } from "../global_styles/styles";

type ItemType = "official" | "bill";

type Item = {
  id: string;
  type: ItemType;
  name: string;
  party: string;
  role: string;
  date: string;
  committee: string;
  update: string;
  avatar?: any;
};

const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    type: "official",
    name: "Zohran Mamdani",
    party: "D",
    role: "Mayor, New York City",
    date: "",
    committee: "",
    update: "",
    avatar: require("../../assets/officials_images/zohran.jpg"),
  },
  {
    id: "2",
    type: "bill",
    name: "H.R.187 · MAPWaters Act of 2025",
    party: "",
    role: "",
    date: "12/18/2025",
    committee: "Agriculture",
    update: "To President",
    avatar: require("../../assets/bills_icons/agriculture.png"),
  },
  {
    id: "3",
    type: "official",
    name: "Alexandria Ocasio-Cortez",
    party: "D",
    role: "Representative, NY 14th District",
    date: "",
    committee: "",
    update: "",
    avatar: require("../../assets/officials_images/aoc.webp"),
  },
  {
    id: "4",
    type: "official",
    name: "John Kennedy",
    party: "R",
    role: "Senator, Louisiana",
    date: "",
    committee: "",
    update: "Up for Reelection",
    avatar: require("../../assets/officials_images/jKennedy.jpg"),
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState("My List");
  const [showListSelection, setShowListSelection] = useState(false);
  const [selectedList, setSelectedList] = useState("My List");

  return (
    <View style={componentStyles.container}>
      <View style={componentStyles.headerBar}>
        <View style={componentStyles.headerLeft}>
          <Pressable
            onPress={() => setShowListSelection(!showListSelection)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Text style={[componentStyles.header, { alignItems: "center" }]}>
                {selectedList}
              </Text>
              {showListSelection ? (
                <ChevronUp
                  size={24}
                  color="#535353"
                  style={{ marginBottom: 12 }}
                />
              ) : (
                <ChevronDown
                  size={24}
                  color="#535353"
                  style={{ marginBottom: 12 }}
                />
              )}
            </View>
          </Pressable>
        </View>
        <View style={componentStyles.headerRight}>
          <Pressable
            onPress={() => setShowSearchModal(true)}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <Search size={24} color="#535353" />
          </Pressable>
          <Pressable
            onPress={() => {
              setShowOptionsModal(true);
            }}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
            })}
          >
            <MoreVertical size={24} color="#535353" />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={componentStyles.listContent}
        renderItem={({ item }) => <Card item={item} />}
      />

      {/* Search Modal Popup */}
      <SearchModal
        isVisible={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
        }}
        // onSearch={(query) => {
        //   setSearchQuery(query);
        // }}
        onSearch={setSearchQuery}
      />
      {/* Options Modal Popup */}
      <OptionsModal
        showOptionsModal={showOptionsModal}
        setShowOptionsModal={setShowOptionsModal}
        selectedNotifications={selectedNotifications}
        setSelectedNotifications={setSelectedNotifications}
      />
      {/* List Selection Modal Popup */}
      <ListSelection
        showListSelection={showListSelection}
        setShowListSelection={setShowListSelection}
        selectedList={selectedList}
        setSelectedList={setSelectedList}
      />
    </View>
  );
}

function Card({ item }: { item: Item }) {
  const router = useRouter();
  const isOfficial = item.type === "official";

  const onPress = () => {
    if (isOfficial) {
      router.navigate(`/official/${item.id}`);
    } else {
      router.navigate(`/bill/${item.id}`);
    }
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <View style={[componentStyles.officialCard]}>
        <Image source={item.avatar} style={componentStyles.avatar} />

        {isOfficial ? (
          <View>
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
        ) : (
          <View>
            <Text style={componentStyles.name}>{item.name}</Text>

            <View style={componentStyles.metaRow}>
              <Text style={componentStyles.subtitle}>{item.date}</Text>
              <Text style={componentStyles.separator}>·</Text>
              <Text style={componentStyles.subtitle}>{item.committee}</Text>
              {item.update ? (
                <>
                  <Text style={componentStyles.separator}>·</Text>
                  <Text style={componentStyles.update}>{item.update}</Text>
                </>
              ) : null}
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}
