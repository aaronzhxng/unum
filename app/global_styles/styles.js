import { StyleSheet } from "react-native"; // ✅ ADD THIS LINE

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#fafafa",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 45,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 16,
    width: 300,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
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
    fontWeight: 900,
  },
  update: {
    fontSize: 12,
    color: "#000000",
    fontWeight: 600,
  },
});
