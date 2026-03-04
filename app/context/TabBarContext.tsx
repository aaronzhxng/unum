import { createContext, useContext, useState } from "react";

interface TabBarContextType {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
}

export const TabBarContext = createContext<TabBarContextType>({
  tabBarHidden: false,
  setTabBarHidden: () => {},
});

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  return (
    <TabBarContext.Provider value={{ tabBarHidden, setTabBarHidden }}>
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  return useContext(TabBarContext);
}
