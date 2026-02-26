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
  photoUrl?: string;
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

    // Only create default list if NO lists exist
    if (lists.length === 0) {
      const defaultList = {
        id: "my-list",
        name: "My List",
        items: [],
      };
      lists.push(defaultList);
      await storage.saveLists(lists);
      await storage.setCurrentListId(defaultList.id);
      return defaultList;
    }

    // Return first list if it exists
    return lists[0];
  },

  // Delete a list by ID
  deleteList: async (listId: string): Promise<void> => {
    try {
      const lists = await storage.getLists();

      // Don't allow deleting if it's the last list
      if (lists.length <= 1) {
        console.warn("Cannot delete the last list");
        return;
      }

      const updatedLists = lists.filter((l) => l.id !== listId);
      await storage.saveLists(updatedLists);

      // Reset current list if the deleted one was active
      const currentId = await storage.getCurrentListId();
      if (currentId === listId && updatedLists.length > 0) {
        await storage.setCurrentListId(updatedLists[0].id);
      }
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  },
};
