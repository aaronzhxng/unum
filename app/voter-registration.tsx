import { useRouter } from "expo-router";
import { ChevronLeft, ExternalLink } from "lucide-react-native";
import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

export default function VoterRegistrationScreen() {
  const router = useRouter();

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
        }}
      >
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

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 80 }}>
        {/* Hero */}
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
        <Text
          style={{
            fontSize: 15,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 24,
          }}
        >
          The bills and officials you track on Unum are shaped by elections.
          Voter turnout directly determines who holds office — and who sponsors
          and votes on the legislation that affects your life. Registering to
          vote is the most direct way to have a say.
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: "#535353",
            lineHeight: 24,
            marginBottom: 32,
          }}
        >
          Registration deadlines and rules vary by state, but the links below
          will walk you through everything based on where you live.
        </Text>

        {/* Links */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: "#1a1a1a",
            marginBottom: 12,
          }}
        >
          Get started
        </Text>

        {[
          {
            label: "Check or update your registration",
            url: "https://vote.gov",
            description:
              "vote.gov — official U.S. government voter registration portal",
          },
          {
            label: "Register to vote",
            url: "https://vote.org/register-to-vote/",
            description:
              "vote.org — guides you through state-specific registration",
          },
          {
            label: "Check registration deadlines by state",
            url: "https://vote.org/voter-registration-deadlines/",
            description: "Deadlines vary — check yours before it's too late",
          },
        ].map((link) => (
          <Pressable
            key={link.url}
            onPress={() => Linking.openURL(link.url)}
            style={({ pressed }) => ({
              backgroundColor: pressed ? "#f0f0f0" : "#fff",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 4,
              elevation: 2,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            })}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
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
              <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                {link.description}
              </Text>
            </View>
            <ExternalLink size={18} color="#008CFF" />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
