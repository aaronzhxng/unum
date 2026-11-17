import { createContext, useCallback, useContext, useState } from "react";

// A committee for the Officials tab to open, asked for from a screen stacked
// above the tabs. `at` tells a repeat request for the same committee apart.
export type CommitteeRequest = {
  committeeId: string;
  subcommitteeId: string | null;
  at: number;
};

// Tab indexes, in the order (tabs)/_layout.tsx shows them
export const OFFICIALS_TAB = 1;

interface TabBarContextType {
  tabBarHidden: boolean;
  setTabBarHidden: (hidden: boolean) => void;
  // Which tab is showing. The tabs live in a pager, so every one counts as
  // focused to the navigator all the time.
  activeTab: number;
  setActiveTab: (index: number) => void;
  // A tab another screen wants shown; the tabs layout moves to it
  tabRequest: { index: number; at: number } | null;
  requestTab: (index: number) => void;
  committeeRequest: CommitteeRequest | null;
  openCommittee: (committeeId: string, subcommitteeId?: string | null) => void;
  // Each request is cleared once handled. The tab screens remount when a
  // back gesture returns to Home, and would otherwise act on it again.
  clearTabRequest: () => void;
  clearCommitteeRequest: () => void;
}

export const TabBarContext = createContext<TabBarContextType>({
  tabBarHidden: false,
  setTabBarHidden: () => {},
  activeTab: 0,
  setActiveTab: () => {},
  tabRequest: null,
  requestTab: () => {},
  committeeRequest: null,
  openCommittee: () => {},
  clearTabRequest: () => {},
  clearCommitteeRequest: () => {},
});

export function TabBarProvider({ children }: { children: React.ReactNode }) {
  const [tabBarHidden, setTabBarHidden] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [tabRequest, setTabRequest] =
    useState<TabBarContextType["tabRequest"]>(null);
  const [committeeRequest, setCommitteeRequest] =
    useState<CommitteeRequest | null>(null);
  const requestTab = useCallback(
    (index: number) => setTabRequest({ index, at: Date.now() }),
    [],
  );
  const openCommittee = useCallback(
    (committeeId: string, subcommitteeId: string | null = null) => {
      setCommitteeRequest({ committeeId, subcommitteeId, at: Date.now() });
      setTabRequest({ index: OFFICIALS_TAB, at: Date.now() });
    },
    [],
  );
  const clearTabRequest = useCallback(() => setTabRequest(null), []);
  const clearCommitteeRequest = useCallback(
    () => setCommitteeRequest(null),
    [],
  );
  return (
    <TabBarContext.Provider
      value={{
        tabBarHidden,
        setTabBarHidden,
        activeTab,
        setActiveTab,
        tabRequest,
        requestTab,
        committeeRequest,
        openCommittee,
        clearTabRequest,
        clearCommitteeRequest,
      }}
    >
      {children}
    </TabBarContext.Provider>
  );
}

export function useTabBar() {
  return useContext(TabBarContext);
}
