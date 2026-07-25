import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { syncPreferencesToBackend } from "../utils/syncPreferences";
import { pushToken } from "../utils/pushToken";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Image, Platform, Pressable, Text, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTabBar } from "../context/TabBarContext";
import { TourProvider, useTour } from "../context/TourContext";
import { getDb } from "../utils/database";
import EducationScreen from "./education";
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
  {
    name: "education",
    icon: require("../../assets/education_icons/education.png"),
    size: 28,
  },
];

function RootOffsetDetector() {
  const { setLayoutOffset } = useTour();
  return (
    <View
      collapsable={false}
      onLayout={(e) => {
        const { y } = e.nativeEvent.layout;
        setLayoutOffset(y);
      }}
      style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1 }}
    />
  );
}

function TourConsumer({ tabBarRef }: { tabBarRef: { current: any } }) {
  const { startTour, isActive, currentStep, setTargetLayout, setHasListItems } =
    useTour();

  useEffect(() => {
    if (isActive && currentStep === 2) {
      setTimeout(() => {
        if (tabBarRef.current) {
          tabBarRef.current.measureInWindow(
            (px: number, py: number, pw: number, ph: number) => {
              if (pw > 0)
                setTargetLayout({
                  x: px,
                  y: py,
                  width: pw,
                  height: Math.min(ph, 60),
                });
            },
          );
        }
      }, 300);
    }
  }, [isActive, currentStep]);

  useEffect(() => {
    const checkPendingTour = async () => {
      const pending = await AsyncStorage.getItem("pending_tour");
      if (pending === "true") {
        await AsyncStorage.removeItem("pending_tour");
        const isRelaunch =
          (await AsyncStorage.getItem("pending_tour_relaunch")) === "true";
        if (isRelaunch) {
          await AsyncStorage.removeItem("pending_tour_relaunch");
        }

        const listsRaw = await AsyncStorage.getItem("user_lists");
        let itemCount = 0;
        if (listsRaw) {
          try {
            const lists = JSON.parse(listsRaw);
            itemCount = lists?.[0]?.items?.length ?? 0;
          } catch {}
        }
        try {
          const db = getDb();
          const row = db.getFirstSync(
            `SELECT COUNT(*) as count FROM list_items`,
          ) as { count: number } | null;
          if (row && row.count > 0) itemCount = row.count;
        } catch {}

        setHasListItems(itemCount > 0);
        setTimeout(() => startTour(isRelaunch), 500);
      }
    };
    checkPendingTour();
  }, []);

  return null;
}

function TourOverlay() {
  const {
    isActive,
    currentStep,
    steps,
    targetLayout,
    nextStep,
    endTour,
    layoutOffset,
  } = useTour();

  if (!isActive || !targetLayout) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const statusBarHeight =
    Platform.OS === "android" ? (Constants.statusBarHeight ?? 0) : 0;
  const adjustedY = targetLayout.y + statusBarHeight;

  const TOOLTIP_HEIGHT = 140;
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const isCenteredStep = currentStep === 1;
  const showAbove =
    !isCenteredStep &&
    adjustedY + targetLayout.height + TOOLTIP_HEIGHT > SCREEN_HEIGHT - 100;

  const tooltipTop = isCenteredStep
    ? SCREEN_HEIGHT * 0.55 - TOOLTIP_HEIGHT / 2
    : currentStep === 2
      ? Math.max(adjustedY - TOOLTIP_HEIGHT - 12 - 50, 60)
      : showAbove
        ? Math.max(adjustedY - TOOLTIP_HEIGHT - 12, 60)
        : Math.min(
            adjustedY + targetLayout.height + 12,
            SCREEN_HEIGHT - TOOLTIP_HEIGHT - 80,
          );

  return (
    <>
      <View
        pointerEvents="box-only"
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

      {!isCenteredStep && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: adjustedY - 6,
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
      )}

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
          <Pressable
            onPress={endTour}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text style={{ fontSize: 14, color: "#7B7C81" }}>Skip tour</Text>
          </Pressable>
          <Pressable
            onPress={nextStep}
            style={({ pressed }) => ({
              backgroundColor: "#008CFF",
              paddingHorizontal: 20,
              paddingVertical: 10,
              borderRadius: 20,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
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
  const tabBarRef = useRef<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const pagerRef = useRef<PagerView>(null);
  const { tabBarHidden } = useTabBar();
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));
  // Guard against stale onPageSelected events that fire during the
  // focus-recovery snap. Without this, a late drift event can override
  // the snap and land back on page 0.
  const focusRecoveryRef = useRef(false);
  // Stored in refs so both timers can be cancelled on every cleanup cycle,
  // preventing a guard-release from a previous focus cycle leaking into the next.
  const snapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // scrollEnabled is disabled while the tabs screen is not in focus.
  // This stops the native PagerView from drifting at all, rather than
  // trying to correct it after the fact.
  const [pagerScrollEnabled, setPagerScrollEnabled] = useState(true);

  useEffect(() => {
    const SYNC_KEY = "push_token_last_synced";
    const ONE_DAY = 24 * 60 * 60 * 1000;
    AsyncStorage.getItem(SYNC_KEY).then(async (raw) => {
      const last = raw ? parseInt(raw, 10) : 0;
      if (Date.now() - last > ONE_DAY) {
        await pushToken.register();
        syncPreferencesToBackend().catch(() => {});
        AsyncStorage.setItem(SYNC_KEY, String(Date.now()));
      }
    });
  }, []);

  const navigateToTab = (index: number) => {
    pagerRef.current?.setPage(index);
    setActiveIndex(index);
    activeIndexRef.current = index;
    setVisitedTabs((prev) => new Set([...prev, index]));
  };

  // When returning to (tabs) via swipe-back, the PagerView can drift to
  // page 0. Two-layer defence:
  //   1. scrollEnabled=false while we are away  → native layer cannot move the
  //      pager at all, so the drift never happens in the first place.
  //   2. focusRecoveryRef guard + snap           → catches anything that still
  //      slips through (e.g. a programmatic reset from RN reconciliation).
  // Cleanup sets the guard to true and disables scroll BEFORE we leave so
  // both protections are in place before any native events can fire.
  useFocusEffect(
    useCallback(() => {
      // Cancel any timers left over from a previous focus cycle
      if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
      if (guardTimerRef.current) clearTimeout(guardTimerRef.current);

      // activeIndexRef was protected while we were away, so it still holds
      // the correct page even if the PagerView internally drifted.
      const targetPage = activeIndexRef.current;
      setActiveIndex(targetPage);

      // Snap, then re-enable scroll and release the guard
      snapTimerRef.current = setTimeout(() => {
        pagerRef.current?.setPage(targetPage);
        setPagerScrollEnabled(true);
        guardTimerRef.current = setTimeout(() => {
          focusRecoveryRef.current = false;
        }, 300);
      }, 50);

      return () => {
        if (snapTimerRef.current) clearTimeout(snapTimerRef.current);
        if (guardTimerRef.current) clearTimeout(guardTimerRef.current);
        // Disable scroll and raise the guard the moment we leave.
        // This must happen before any native drift event can fire.
        setPagerScrollEnabled(false);
        focusRecoveryRef.current = true;
      };
    }, [])
  );

  return (
    <TourProvider onNavigateTab={navigateToTab}>
      <View style={{ flex: 1 }}>
        <RootOffsetDetector />
        <TourConsumer tabBarRef={tabBarRef} />
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          scrollEnabled={pagerScrollEnabled}
          onPageSelected={(e) => {
            // Drop every event while the guard is active. scrollEnabled=false
            // already prevents user-initiated moves; this catches any
            // programmatic/reconciliation events that still slip through.
            if (focusRecoveryRef.current) return;
            const index = e.nativeEvent.position;
            setActiveIndex(index);
            activeIndexRef.current = index; // keep ref in sync with manual swipes
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
          <View key="3" style={{ flex: 1 }}>
            {visitedTabs.has(3) && <EducationScreen />}
          </View>
        </PagerView>

        {!tabBarHidden && (
          <View
            ref={tabBarRef}
            collapsable={false}
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
                {(tab as any).icon ? (
                  <Image
                    source={(tab as any).icon}
                    style={{
                      width: tab.size,
                      height: tab.size,
                      tintColor: activeIndex === index ? "black" : "#8e8e93",
                    }}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name={
                      (activeIndex === index
                        ? tab.activeIcon
                        : tab.inactiveIcon) as any
                    }
                    size={tab.size}
                    color={activeIndex === index ? "black" : "#8e8e93"}
                  />
                )}
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
