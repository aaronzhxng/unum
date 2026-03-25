import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type TourStep = {
  tab: number;
  title: string;
  description: string;
  requiresItems?: boolean;
};

const TOUR_STEPS: TourStep[] = [
  {
    tab: 0,
    title: "Your Lists",
    description:
      "Tap here to switch between your lists or create new ones to organize officials and bills.",
  },
  {
    tab: 0,
    title: "Your Items",
    description:
      "Long press any card to enter edit mode — reorder, move, or remove items from your list.",
    requiresItems: true,
  },
  {
    tab: 0,
    title: "Navigate",
    description:
      "Use these three tabs to switch between your lists, browse officials, and explore legislation.",
  },
  {
    tab: 1,
    title: "Browse by State",
    description:
      "Tap here to filter officials by state. Set a priority state to see it first every time.",
  },
  {
    tab: 1,
    title: "Add Officials",
    description:
      "Tap the + button on any official to add them to one of your lists.",
  },
  {
    tab: 2,
    title: "Filter Legislation",
    description: "Tap here to filter bills by chamber, policy area, or type.",
  },
  {
    tab: 2,
    title: "Get Notified",
    description:
      "Tap the bell to get notified about new bills in policy areas you care about.",
  },
];

type TargetLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

type TourContextType = {
  isActive: boolean;
  currentStep: number;
  steps: TourStep[];
  targetLayout: TargetLayout;
  layoutOffset: number;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  setTargetLayout: (layout: TargetLayout) => void;
  setLayoutOffset: (offset: number) => void;
  markAppReady: () => void;
  setHasListItems: (has: boolean) => void;
};

const TourContext = createContext<TourContextType | null>(null);

export const useTour = () => {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within TourProvider");
  return ctx;
};

export function TourProvider({
  children,
  onNavigateTab,
}: {
  children: React.ReactNode;
  onNavigateTab: (tab: number) => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetLayout, setTargetLayout] = useState<TargetLayout>(null);
  const [pendingStart, setPendingStart] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [hasListItems, setHasListItems] = useState(false);
  const router = useRouter();
  const [layoutOffset, setLayoutOffset] = useState(0);

  const startTour = useCallback(() => {
    if (appReady) {
      setCurrentStep(0);
      setTargetLayout(null);
      setIsActive(true);
      onNavigateTab(0);
    } else {
      setPendingStart(true);
    }
  }, [appReady, onNavigateTab]);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
    setTargetLayout(null);
    router.replace("/(tabs)/home" as any);
  }, [router]);

  const nextStep = useCallback(() => {
    let next = currentStep + 1;

    // Skip steps that require list items if the list is empty
    while (
      next < TOUR_STEPS.length &&
      TOUR_STEPS[next].requiresItems &&
      !hasListItems
    ) {
      next++;
    }

    if (next >= TOUR_STEPS.length) {
      endTour();
      return;
    }
    const nextTab = TOUR_STEPS[next].tab;
    const currentTab = TOUR_STEPS[currentStep].tab;
    setTargetLayout(null);
    setCurrentStep(next);
    if (nextTab !== currentTab) {
      onNavigateTab(nextTab);
    }
  }, [currentStep, endTour, hasListItems, onNavigateTab]);

  const markAppReady = useCallback(() => {
    setAppReady(true);
  }, []);

  useEffect(() => {
    if (pendingStart && appReady) {
      setPendingStart(false);
      setCurrentStep(0);
      setTargetLayout(null);
      setIsActive(true);
      onNavigateTab(0);
    }
  }, [pendingStart, appReady]);

  return (
    <TourContext.Provider
      value={{
        isActive,
        currentStep,
        steps: TOUR_STEPS,
        targetLayout,
        startTour,
        endTour,
        nextStep,
        setTargetLayout,
        markAppReady,
        layoutOffset,
        setLayoutOffset,
        setHasListItems,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}
