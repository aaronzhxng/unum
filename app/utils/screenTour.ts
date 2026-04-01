import AsyncStorage from "@react-native-async-storage/async-storage";

export const screenTour = {
  hasSeenOfficialTour: async (): Promise<boolean> => {
    const val = await AsyncStorage.getItem("official_tour_seen");
    return val === "true";
  },
  markOfficialTourSeen: async () => {
    await AsyncStorage.setItem("official_tour_seen", "true");
  },
  hasSeenBillTour: async (): Promise<boolean> => {
    const val = await AsyncStorage.getItem("bill_tour_seen");
    return val === "true";
  },
  markBillTourSeen: async () => {
    await AsyncStorage.setItem("bill_tour_seen", "true");
  },
  isRelaunchOfficialTour: async (): Promise<boolean> => {
    const val = await AsyncStorage.getItem("official_tour_from_relaunch");
    return val === "true";
  },
  clearRelaunchOfficialTour: async () => {
    await AsyncStorage.removeItem("official_tour_from_relaunch");
  },
  isRelaunchBillTour: async (): Promise<boolean> => {
    const val = await AsyncStorage.getItem("bill_tour_from_relaunch");
    return val === "true";
  },
  clearRelaunchBillTour: async () => {
    await AsyncStorage.removeItem("bill_tour_from_relaunch");
  },
  triggerRelaunchOfficialTour: async () => {
    await AsyncStorage.setItem("official_tour_from_relaunch", "true");
  },
  triggerRelaunchBillTour: async () => {
    await AsyncStorage.setItem("bill_tour_from_relaunch", "true");
  },
};
