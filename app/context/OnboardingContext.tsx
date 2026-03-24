import React, { createContext, useContext, useState } from "react";

export type FamiliarityLevel = "low" | "mid" | "high" | null;

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
  familiarityLevel: FamiliarityLevel;
  userRepBioguideId: string | null;
  setSelectedOfficials: (ids: string[]) => void;
  setSelectedBills: (ids: string[]) => void;
  setSelectedPolicyAreas: (areas: string[]) => void;
  setPriorityState: (state: string | null) => void;
  setFamiliarityLevel: (level: FamiliarityLevel) => void;
  setUserRepBioguideId: (id: string | null) => void;
  overlayConfig: OverlayConfig | null;
  setOverlayConfig: (config: OverlayConfig | null) => void;
}

const OnboardingContext = createContext<OnboardingData>({
  selectedOfficials: [],
  selectedBills: [],
  selectedPolicyAreas: [],
  priorityState: null,
  familiarityLevel: null,
  userRepBioguideId: null,
  setSelectedOfficials: () => {},
  setSelectedBills: () => {},
  setSelectedPolicyAreas: () => {},
  setPriorityState: () => {},
  setFamiliarityLevel: () => {},
  setUserRepBioguideId: () => {},
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
  const [familiarityLevel, setFamiliarityLevel] =
    useState<FamiliarityLevel>(null);
  const [userRepBioguideId, setUserRepBioguideId] = useState<string | null>(
    null,
  );
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
        familiarityLevel,
        setFamiliarityLevel,
        userRepBioguideId,
        setUserRepBioguideId,
        overlayConfig,
        setOverlayConfig,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => useContext(OnboardingContext);
