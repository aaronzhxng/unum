import React, { createContext, useContext, useState } from "react";

interface OverlayConfig {
  dotIndex: number;
  continueLabel: string;
  onContinue: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  showBorder?: boolean;
}

interface OnboardingData {
  selectedOfficials: string[];
  selectedBills: string[];
  selectedPolicyAreas: string[];
  priorityState: string | null;
  listName: string;
  setSelectedOfficials: (ids: string[]) => void;
  setSelectedBills: (ids: string[]) => void;
  setSelectedPolicyAreas: (areas: string[]) => void;
  setPriorityState: (state: string | null) => void;
  setListName: (name: string) => void;
  overlayConfig: OverlayConfig | null;
  setOverlayConfig: (config: OverlayConfig | null) => void;
}

const OnboardingContext = createContext<OnboardingData>({
  selectedOfficials: [],
  selectedBills: [],
  selectedPolicyAreas: [],
  priorityState: null,
  listName: "",
  setSelectedOfficials: () => {},
  setSelectedBills: () => {},
  setSelectedPolicyAreas: () => {},
  setPriorityState: () => {},
  setListName: () => {},
  overlayConfig: null,
  setOverlayConfig: () => {},
});

export const OnboardingProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [selectedOfficials, setSelectedOfficials] = useState<string[]>([]);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [selectedPolicyAreas, setSelectedPolicyAreas] = useState<string[]>([]);
  const [priorityState, setPriorityState] = useState<string | null>(null);
  const [listName, setListName] = useState("");
  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig | null>(
    null,
  );

  return (
    <OnboardingContext.Provider
      value={{
        selectedOfficials,
        setSelectedOfficials,
        selectedBills,
        setSelectedBills,
        selectedPolicyAreas,
        setSelectedPolicyAreas,
        priorityState,
        setPriorityState,
        listName,
        setListName,
        overlayConfig,
        setOverlayConfig,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
