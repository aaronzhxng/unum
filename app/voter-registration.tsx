import { useRouter } from "expo-router";
import { ChevronLeft, ExternalLink, MoreVertical } from "lucide-react-native";
import React, { useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { getDb } from "./utils/database";

export default function VoterRegistrationScreen() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 56,
          paddingHorizontal: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 12, flexDirection: "row", alignItems: "center" }}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => ({
              transform: [{ scale: pressed ? 0.75 : 1 }],
              marginRight: 8,
            })}
          >
            <ChevronLeft size={24} color="#535353" />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1a1a1a" }}>
            Voter Registration
          </Text>
        </View>
        <Pressable
          onPress={() => setShowMenu(true)}
          style={({ pressed }) => ({
            transform: [{ scale: pressed ? 0.75 : 1 }],
            marginRight: 8,
          })}
        >
          <MoreVertical size={24} color="#535353" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
        {/* Hero */}
        {/* <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
          <Text style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>
            🗳️
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: "#1a1a1a",
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Your vote matters
          </Text>
        </View> */}
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
          }}
        >
          The bills and officials you track on Unum are shaped by elections.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
          }}
        >
          Laws ordain the frameworks that determine the safety of your home, the
          finances you hold, the vigor of your land, and the weight of your
          ethics. To have a say in them is a granted privilege in trust of your
          judgement as an adult, it is why children cannot vote. No matter how
          insignificant your singular vote may appear to be, you will always
          have inifinitely more say in your government than in any corporation.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
          }}
        >
          Apathy towards the structure and disillusionment to challenge renders
          this application purposeless, and nothing more besides a dusting
          encyclopedia.
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#008CFF",
            lineHeight: 24,
            marginTop: 12,
            marginBottom: 32,
            fontWeight: 600,
          }}
        >
          Voter turnout is the backbone to a functioning democracy. It is both a
          right and responsibility.
        </Text>

        {/* Links */}
        {/* <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 12,
          }}
        >
          Get started
        </Text> */}

        {[
          {
            label: "Check or update your registration",
            url: "https://vote.gov",
          },
          {
            label: "Register to vote",
            url: "https://vote.org/register-to-vote/",
          },
          {
            label: "Check registration deadlines by state",
            url: "https://vote.org/voter-registration-deadlines/",
          },
        ].map((link) => (
          <Pressable
            key={link.url}
            onPress={() => Linking.openURL(link.url)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#f0f0f0" : "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
              // justifyContent: "center",
            })}
          >
            <View
              style={{ flex: 1, marginRight: 12, justifyContent: "center" }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: "#1a1a1a",
                  marginBottom: 4,
                }}
              >
                {link.label}
              </Text>
            </View>
            <ExternalLink size={18} color="#008CFF" />
          </Pressable>
        ))}
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            // marginTop: 24,
          }}
        >
          Registration deadlines and rules vary by state, but the links below
          will walk you through everything based on where you live.
        </Text>
      </ScrollView>

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
        statusBarTranslucent
      >
        <Pressable style={{ flex: 1 }} onPress={() => setShowMenu(false)}>
          <View
            style={{
              position: "absolute",
              right: 24,
              top: 100,
              backgroundColor: "#fff",
              borderRadius: 12,
              padding: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Pressable
              onPress={() => {
                setShowMenu(false);
                const db = getDb();
                db.runSync(
                  `INSERT INTO meta (key, value) VALUES ('voter_card_dismissed', 'true')
             ON CONFLICT(key) DO UPDATE SET value = 'true'`,
                );
                router.back();
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: "#535353" }}>
                Hide from home screen
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowMenu(false);
              }}
              style={({ pressed }) => ({
                paddingHorizontal: 16,
                paddingVertical: 12,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 15, color: "#FF3B30" }}>
                Report an error
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
