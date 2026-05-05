import { useRouter } from "expo-router";
import { ChevronLeft, ExternalLink } from "lucide-react-native";
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
            fontSize: 16,
            color: "#008CFF",
            lineHeight: 24,
            marginTop: 12,
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          Almost every United States citizen aged eighteen or older has the
          right and the responsibility to vote.
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: "#008CFF",
            lineHeight: 24,
            // marginTop: 12,
            marginBottom: 24,
            fontWeight: 600,
          }}
        >
          You can vote by mail, early, or on the day, so long as you are
          registered.
        </Text>
        {/* <Text
          style={{
            fontSize: 16,
            color: "#008CFF",
            lineHeight: 24,
            marginTop: 12,
            marginBottom: 12,
            fontWeight: 600,
          }}
        >
          Voting helps hold the government to account by making sure politicians
          know about the issues that matter to you.
        </Text> */}

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
            marginBottom: 12,
          }}
        >
          Registration deadlines and rules vary by state, but the links below
          will walk you through everything based on where you live.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
          }}
        >
          Make sure you get your information about registering to vote from
          trustworthy sources, such as www.vote.gov,
          usa.gov/voting-and-elections, or the website of your state’s board of
          elections.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
          }}
        >
          Before you go to actually vote, you should know all of the following:
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
            marginLeft: 12,
          }}
        >
          1. How, when, and where to vote.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
            marginLeft: 12,
          }}
        >
          2. What documents, if any, you need to bring to the polling-booth.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
            marginLeft: 12,
          }}
        >
          3. Who is up for election. Elections to Congress take place every two
          years. Elections for president and vice-president take place every
          four years. Elections to smaller offices might take place more
          frequently. A ballot can include many people all running for different
          offices.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
            marginLeft: 12,
          }}
        >
          4. How to mark a ballot. Before an election, you can find voter guides
          and example ballots online, and you can bring papers with you in the
          polling place.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
            marginLeft: 12,
          }}
        >
          5. Who you want to vote for. The decision you make could impact the
          lives of yourself and millions of others. Make sure you are voting for
          the person you feel is best for the job.
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 12,
            marginLeft: 12,
          }}
        >
          6. If you need any help. If you have problems with vision, if English
          is not your first language, or if you have any other concerns, you
          should call your local board of elections to see what can be done for
          you.
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
