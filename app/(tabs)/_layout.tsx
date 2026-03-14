import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useTabBar } from "../context/TabBarContext";
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

export default function TabsLayout() {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { tabBarHidden } = useTabBar();
  const [visitedTabs, setVisitedTabs] = useState<Set<number>>(new Set([0]));

  return (
    <View style={{ flex: 1 }}>
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
              onPress={() => pagerRef.current?.setPage(index)}
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
    </View>
  );
}
