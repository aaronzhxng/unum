import { StyleSheet } from "react-native"; // ✅ ADD THIS LINE

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 48,
    backgroundColor: "#fafafa",
  },
  header: {
    paddingBottom: 16,
  },
  billNumber: {
    fontSize: 16,
    color: "#000000",
    fontWeight: "600",
    marginBottom: 8,
  },
  billTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#000000",
    marginBottom: 12,
    lineHeight: 24,
  },
  statusRow: {
    flexDirection: "row",
    gap: 12,
  },
  status: {
    fontSize: 14,
    color: "#008CFF",
    fontWeight: "600",
    backgroundColor: "rgba(0, 140, 255, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  date: {
    fontSize: 14,
    color: "#535353",
  },
  tabsNegative: {
    marginHorizontal: -16,
    marginBottom: 24,
  },
  tabs: {
    flexDirection: "row",
    gap: 24,
    paddingLeft: 32,
    paddingRight: 32,
    borderBottomWidth: 2,
    borderBottomColor: "#bfbfbf",
  },
  tab: {
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  tabActive: {
    color: "#000",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    marginBottom: -2,
  },
  section: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: "#fafafa",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#000",
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    color: "#535353",
  },
  committee: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  sponsorRow: {
    gap: 4,
  },
  sponsorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  sponsorParty: {
    fontSize: 14,
    color: "#535353",
  },
  amendments: {
    fontSize: 14,
    color: "#535353",
  },
  legislationHeader: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  legislationContainer: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
});
