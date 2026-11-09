import { createContext, useContext, useState } from "react";

interface TabBarContextType {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
  // Which tab is showing. The tabs live in a pager, so every one counts as
  // focused to the navigator all the time.
  activeTab: number;
  setActiveTab: (index: number) => void;
}

export const TabBarContext = createContext<TabBarContextType>({
  tabBarHidden: false,
  setTabBarHidden: () => {},
  activeTab: 0,
  setActiveTab: () => {},
});

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  return (
    <TabBarContext.Provider
      value={{ tabBarHidden, setTabBarHidden, activeTab, setActiveTab }}
    >
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  return useContext(TabBarContext);
}
