import { FlatList, Image, StyleSheet, Text, View } from "react-native";

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
  avatarUrl?: string; // optional for bills
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
    avatarUrl: "https://placehold.co/64x64", // placeholder
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
    avatarUrl: "https://placehold.co/64x64", // placeholder
  },
  {
    id: "3",
    type: "official",
    name: "John Kennedy",
    party: "R",
    role: "Senator, Louisiana",
    date: "",
    committee: "",
    update: "Up for Reelection",
    avatarUrl: "https://placehold.co/64x64",
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>My List</Text>
      <FlatList
        data={MOCK_ITEMS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <Card item={item} />}
      />
    </View>
  );
}

function Card({ item }: { item: Item }) {
  const isOfficial = item.type === "official";

  return (
    <View style={[styles.officialCard]}>
      <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />

      {isOfficial ? (
      <View>
        <Text style={styles.name}>{item.name}</Text>
      
        <View style={styles.metaRow}>
          <Text style={styles.subtitle}>{item.party}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.subtitle}>{item.role}</Text>
          {item.update ? (
            <>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.update}>{item.update}</Text>
            </>
          ) : null}
        </View>
      </View>      
      ) : (
      <View>
        <Text style={styles.name}>{item.name}</Text>
      
        <View style={styles.metaRow}>
          <Text style={styles.subtitle}>{item.date}</Text>
          <Text style={styles.separator}>·</Text>
          <Text style={styles.subtitle}>{item.committee}</Text>
          {item.update ? (
            <>
              <Text style={styles.separator}>·</Text>
              <Text style={styles.update}>{item.update}</Text>
            </>
          ) : null}
        </View>
      </View>   
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    backgroundColor: "#fafafa",
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  officialCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 14,
    margin: 2,
    borderRadius: 24,
    backgroundColor: "#fafafa",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  iconText: {
    fontWeight: "600",
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    color: "#535353",
    fontWeight: "600",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "baseline",
  },
  subtitle: {
    fontSize: 12,
    color: "#7B7C81",
  },
  separator: {
    fontSize: 12,
    color: "#000000",
    marginHorizontal: 4,
  },
  update: {
    fontSize: 12,
    color: "#000000",
    fontWeight: 600,
  },
  
});
