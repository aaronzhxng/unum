import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { styles as componentStyles } from "./global_styles/styles";
import { getDb } from "./utils/database";

const CREDITS_SECTIONS = [
  {
    title: "App Icon",
    content: `The Unum app icon uses the "Olive" icon from the Game Icons set.\n\nGame Icons — gameicons.net\nLicense: Creative Commons Attribution 3.0 (CC BY 3.0)\nDesigned by Lorc, Delapouite & contributors`,
  },
  {
    title: "Icons & UI",
    content: `Navigation and interface icons are from Lucide.\n\nLucide — lucide.dev\nLicense: MIT License\nCopyright (c) 2020 Lucide Contributors`,
  },
  {
    title: "Data Sources",
    content: `Unum is not affiliated with, endorsed by, or representing any government entity.\n\nLegislative data is sourced from the Congress.gov API (api.congress.gov), provided by the Library of Congress.\n\nMember photos are provided by the Biographical Directory of the United States Congress (bioguide.congress.gov).\n\nGeocoding is provided by the U.S. Census Bureau Geocoding Services and Zippopotam.us.\n\nEducation data sourced in part from Wikipedia contributors under CC BY-SA.`,
  },
  {
    title: "Privacy Policy",
    content: `Last updated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}\n\nUnum is a civic literacy app. We are committed to protecting your privacy.\n\nInformation we collect:\nWe collect push notification tokens solely to deliver bill and official update notifications you opt into. These tokens are stored on our secure server and are never sold or shared with third parties.\n\nInformation we do not collect:\nWe do not collect your name, email address, or any personally identifiable information. We do not use third-party analytics or advertising SDKs. We do not track your location beyond the zip code you optionally provide during onboarding to identify your congressional district.\n\nData storage:\nAll your lists, followed bills, and app preferences are stored locally on your device. Your zip code and notification preferences are stored on our secure server (Railway) solely to deliver relevant notifications.\n\nThird-party services:\nUnum uses Firebase Cloud Messaging (FCM) to deliver push notifications. Firebase is governed by Google's Privacy Policy (policies.google.com/privacy). Legislative data is fetched from the Congress.gov API (api.congress.gov).\n\nChildren's privacy:\nUnum is not directed at children under 13 and does not knowingly collect information from children.\n\nContact:\nFor privacy questions, contact us at unuminitiative.com or through the Report an Error feature in the app.\n\nChanges to this policy:\nWe may update this privacy policy from time to time. Continued use of the app constitutes acceptance of any changes.`,
  },
];

const TIPS_SECTIONS = [
  {
    title: "How to Use Unum",
    content: `Unum is built around three things: officials, legislation, and lists.\n\nLists are your home base. Create a list and add the bills and officials you care about most — your list's home screen will surface updates whenever something changes, like a new vote or a bill advancing through committee.\n\nThe Officials tab lets you browse all 538 members of Congress, filtered by state. Tap any official to see their profile: sponsored bills, voting record, committee assignments, and contact info. Add an official to a list to follow them.\n\nThe Legislation tab shows bills from the current congressional session. You can filter by policy area and follow individual bills to track their progress. When a bill you follow gets a vote, Unum will show you exactly how your followed officials voted.\n\nNotifications are opt-in and granular — you can turn them on per list, per state, or per policy area. Tap the three-dot menu on any screen to manage notification settings.\n\nIf you ever want a guided walkthrough of the app, tap "Relaunch App Tour" above.`,
  },
];

export default function TipsScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [suggestedBillsDismissed, setSuggestedBillsDismissed] = useState(false);
  const [voterCardDismissed, setVoterCardDismissed] = useState(false);

  useEffect(() => {
    const db = getDb();
    const suggestedRow = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'suggested_bills_dismissed'`,
    );
    if (suggestedRow?.value === "true") setSuggestedBillsDismissed(true);

    const voterRow = db.getFirstSync<{ value: string }>(
      `SELECT value FROM meta WHERE key = 'voter_card_dismissed'`,
    );
    if (voterRow?.value === "true") setVoterCardDismissed(true);
  }, []);

  const handleRelaunchTour = async () => {
    await AsyncStorage.setItem("pending_tour", "true");
    await AsyncStorage.setItem("pending_tour_relaunch", "true");
    router.replace("/(tabs)/home" as any);
  };

  const toggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={localStyles.container}>
      {/* Header — matches bill/[id].tsx headerBar pattern */}
      <View style={localStyles.headerBar}>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/home" as any);
          }}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
          })}
        >
          <ChevronLeft size={24} color="#535353" />
        </Pressable>
        <Text style={localStyles.headerTitle}>Tips & Resources</Text>
        {/* Empty view to balance the flex space-between */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={localStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Relaunch Tour Card — styled like officialCard */}
        <Pressable
          style={({ pressed }) => [
            componentStyles.officialCard,
            { marginHorizontal: 0, justifyContent: "space-between" },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleRelaunchTour}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <Ionicons
              name="map-outline"
              size={22}
              color="#008CFF"
              style={{ marginRight: 12 }}
            />
            <View>
              <Text style={localStyles.tourCardTitle}>Relaunch App Tour</Text>
              <Text style={componentStyles.subtitle}>
                Revisit the walkthrough of Unum's features
              </Text>
            </View>
          </View>
          <ChevronDown
            size={18}
            color="#7B7C81"
            style={{ transform: [{ rotate: "-90deg" }] }}
          />
        </Pressable>
        <Text style={localStyles.sectionLabel}>PREFERENCES</Text>
        <Pressable
          onPress={() => {
            const db = getDb();
            const current = db.getFirstSync<{ value: string }>(
              `SELECT value FROM meta WHERE key = 'suggested_bills_dismissed'`,
            );
            const nowDismissed = current?.value !== "true";
            db.runSync(
              `INSERT INTO meta (key, value) VALUES ('suggested_bills_dismissed', ?)
       ON CONFLICT(key) DO UPDATE SET value = ?`,
              [
                nowDismissed ? "true" : "false",
                nowDismissed ? "true" : "false",
              ],
            );
            setSuggestedBillsDismissed(nowDismissed);
          }}
          style={({ pressed }) => [
            localStyles.accordionCard,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={localStyles.accordionHeader}>
            <Text style={localStyles.accordionTitle}>
              Show suggested bills of the week
            </Text>
            <Text style={{ fontSize: 15, color: "#008CFF", fontWeight: "600" }}>
              {suggestedBillsDismissed ? "Off" : "On"}
            </Text>
          </View>
        </Pressable>
        <Pressable
          onPress={() => {
            const db = getDb();
            const current = db.getFirstSync<{ value: string }>(
              `SELECT value FROM meta WHERE key = 'voter_card_dismissed'`,
            );
            const nowDismissed = current?.value !== "true";
            db.runSync(
              `INSERT INTO meta (key, value) VALUES ('voter_card_dismissed', ?)
       ON CONFLICT(key) DO UPDATE SET value = ?`,
              [
                nowDismissed ? "true" : "false",
                nowDismissed ? "true" : "false",
              ],
            );
            setVoterCardDismissed(nowDismissed);
          }}
          style={({ pressed }) => [
            localStyles.accordionCard,
            pressed && { opacity: 0.85 },
          ]}
        >
          <View style={localStyles.accordionHeader}>
            <Text style={localStyles.accordionTitle}>
              Show suggested reference articles
            </Text>
            <Text style={{ fontSize: 15, color: "#008CFF", fontWeight: "600" }}>
              {voterCardDismissed ? "Off" : "On"}
            </Text>
          </View>
        </Pressable>
        {/* Section label */}
        <Text style={localStyles.sectionLabel}>REFERENCE</Text>
        {/* Accordion sections — styled like amendmentsSection */}
        {TIPS_SECTIONS.map((section, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              localStyles.accordionCard,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => toggle(index)}
          >
            {/* Header row — matches sectionHeader */}
            <View style={localStyles.accordionHeader}>
              <Text style={localStyles.accordionTitle}>{section.title}</Text>
              {expandedIndex === index ? (
                <ChevronUp size={20} color="#7B7C81" />
              ) : (
                <ChevronDown size={20} color="#7B7C81" />
              )}
            </View>

            {/* Expanded content — renders below, never beside */}
            {expandedIndex === index && (
              <View style={localStyles.accordionContent}>
                <Text style={localStyles.accordionText}>{section.content}</Text>
              </View>
            )}
          </Pressable>
        ))}
        {/* Credits & Licenses */}
        <Text style={localStyles.sectionLabel}>CREDITS & LICENSES</Text>
        {CREDITS_SECTIONS.map((section, index) => (
          <Pressable
            key={`credit-${index}`}
            style={({ pressed }) => [
              localStyles.accordionCard,
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => {
              const globalIndex = TIPS_SECTIONS.length + index;
              setExpandedIndex(
                expandedIndex === globalIndex ? null : globalIndex,
              );
            }}
          >
            <View style={localStyles.accordionHeader}>
              <Text style={localStyles.accordionTitle}>{section.title}</Text>
              {expandedIndex === TIPS_SECTIONS.length + index ? (
                <ChevronUp size={20} color="#7B7C81" />
              ) : (
                <ChevronDown size={20} color="#7B7C81" />
              )}
            </View>
            {expandedIndex === TIPS_SECTIONS.length + index && (
              <View style={localStyles.accordionContent}>
                <Text style={localStyles.accordionText}>{section.content}</Text>
              </View>
            )}
          </Pressable>
        ))}
        <View style={{ height: 48 }} />
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  // Matches bill/[id].tsx headerBar exactly
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#535353",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tourCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#535353",
    marginBottom: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7B7C81",
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 10,
    marginLeft: 4,
  },
  // Matches amendmentsSection from bill styles
  accordionCard: {
    borderRadius: 24,
    backgroundColor: "#fafafa",
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  // Matches sectionHeader from bill styles
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    flex: 1,
    paddingRight: 8,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  accordionText: {
    fontSize: 14,
    color: "#535353",
    lineHeight: 22,
  },
});
