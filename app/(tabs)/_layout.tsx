import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTabBar } from "../context/TabBarContext";
import { TourProvider, useTour } from "../context/TourContext";
import HomeScreen from "./home";
import LegislationScreen from "./legislation";
import OfficialsScreen from "./officials";

const TABS = [
  { name: "home", activeIcon: "home", inactiveIcon: "home-outline", size: 28 },
  {
    name: "officials",
    activeIcon: "people",
    inactiveIcon: "people-outline",
    size: 30,
  },
  {
    name: "legislation",
    activeIcon: "document-text",
    inactiveIcon: "document-text-outline",
    size: 28,
  },
];

function TourStarter() {
  const { startTour } = useTour();

  useEffect(() => {
    const checkPendingTour = async () => {
      const pending = await AsyncStorage.getItem("pending_tour");
      if (pending === "true") {
        await AsyncStorage.removeItem("pending_tour");
        setTimeout(() => {
          startTour();
        }, 500);
      }
    };
    checkPendingTour();
  }, []);

  return null;
}

function TourOverlay() {
  const { isActive, currentStep, steps, targetLayout, nextStep, endTour } =
    useTour();

  if (!isActive || !targetLayout) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Decide tooltip position — above or below the target
  const TOOLTIP_HEIGHT = 120;
  const SCREEN_HEIGHT = 800; // approximate
  const showAbove =
    targetLayout.y + targetLayout.height + TOOLTIP_HEIGHT > SCREEN_HEIGHT - 100;

  const tooltipTop = showAbove
    ? targetLayout.y - TOOLTIP_HEIGHT - 12
    : targetLayout.y + targetLayout.height + 12;

  return (
    <>
      {/* Darkened overlay with cutout effect approximated by semi-transparent layer */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 998,
        }}
      />

      {/* Highlight ring around target */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: targetLayout.y - 6,
          left: targetLayout.x - 6,
          width: targetLayout.width + 12,
          height: targetLayout.height + 12,
          borderRadius: 16,
          borderWidth: 2.5,
          borderColor: "#008CFF",
          backgroundColor: "rgba(0,140,255,0.08)",
          zIndex: 999,
        }}
      />

      {/* Tooltip bubble */}
      <View
        style={{
          position: "absolute",
          top: tooltipTop,
          left: 16,
          right: 16,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
          zIndex: 1000,
        }}
      >
        {/* Step dots */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === currentStep ? 16 : 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: i === currentStep ? "#008CFF" : "#e0e0e0",
              }}
            />
          ))}
        </View>

        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 6,
          }}
        >
          {step.title}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          {step.description}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Pressable onPress={endTour}>
            <Text style={{ fontSize: 14, color: "#7B7C81" }}>Skip tour</Text>
          </Pressable>
          <Pressable
            onPress={nextStep}
            style={{
              backgroundColor: "#008CFF",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
              {isLast ? "Done" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

function TabsLayoutInner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { tabBarHidden } = useTabBar();
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));

  const navigateToTab = (index: number) => {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
    setVisitedTabs((prev) => new Set([...prev, index]));
  };

  return (
    <TourProvider onNavigateTab={navigateToTab}>
      <View style={{ flex: 1 }}>
        <TourStarter />
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={(e) => {
            const index = e.nativeEvent.position;
            setActiveIndex(index);
            setVisitedTabs((prev) => new Set([...prev, index]));
          }}
        >
          <View key="0" style={{ flex: 1 }}>
            {visitedTabs.has(0) && <HomeScreen />}
          </View>
          <View key="1" style={{ flex: 1 }}>
            {visitedTabs.has(1) && <OfficialsScreen />}
          </View>
          <View key="2" style={{ flex: 1 }}>
            {visitedTabs.has(2) && <LegislationScreen />}
          </View>
        </PagerView>

        {!tabBarHidden && (
          <View
            style={{
              height: 100,
              flexDirection: "row",
              borderTopWidth: 1,
              borderTopColor: "#e0e0e0",
              backgroundColor: "#ffffff",
              paddingBottom: 28,
            }}
          >
            {TABS.map((tab, index) => (
              <Pressable
                key={tab.name}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => navigateToTab(index)}
              >
                <Ionicons
                  name={
                    (activeIndex === index
                      ? tab.activeIcon
                      : tab.inactiveIcon) as any
                  }
                  size={tab.size}
                  color={activeIndex === index ? "black" : "#8e8e93"}
                />
              </Pressable>
            ))}
          </View>
        )}

        <TourOverlay />
      </View>
    </TourProvider>
  );
}

export default function TabsLayout() {
  return <TabsLayoutInner />;
}
