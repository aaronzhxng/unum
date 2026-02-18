import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ListItem {
  id: string;
  type: "official" | "bill";
  name: string;
  party?: string;
  role?: string;
  date?: string;
  committee?: string;
  update?: string;
  avatar?: any;
}

export interface UserList {
  id: string;
  name: string;
  items: ListItem[];
}

const LISTS_KEY = "user_lists";
const CURRENT_LIST_KEY = "current_list_id";

export const storage = {
  // Get all lists
  getLists: async (): Promise<UserList[]> => {
    try {
      const data = await AsyncStorage.getItem(LISTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error loading lists:", error);
      return [];
    }
  },

  // Save all lists
  saveLists: async (lists: UserList[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    } catch (error) {
      console.error("Error saving lists:", error);
    }
  },

  // Get current list ID
  getCurrentListId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(CURRENT_LIST_KEY);
    } catch (error) {
      console.error("Error loading current list:", error);
      return null;
    }
  },

  // Set current list ID
  setCurrentListId: async (id: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(CURRENT_LIST_KEY, id);
    } catch (error) {
      console.error("Error saving current list:", error);
    }
  },

  // Initialize with default list
  initializeDefaultList: async (): Promise<UserList> => {
    const lists = await storage.getLists();

    if (lists.length === 0) {
      const defaultList: UserList = {
        id: "my-list",
        name: "My List",
        items: [],
      };
      await storage.saveLists([defaultList]);
      await storage.setCurrentListId(defaultList.id);
      return defaultList;
    }

    return lists[0];
  },
};
