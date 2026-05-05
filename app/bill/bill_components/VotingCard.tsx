import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import LoadingSpinner from "../../global_components/LoadingSpinner";
import { styles as componentStyles } from "../styles";

interface PartyVotes {
  yea: number;
  nay: number;
  present: number;
  notVoting: number;
}

interface VoteData {
  chamber: string;
  date: string;
  question: string;
  result: string;
  title: string;
  democratic: PartyVotes;
  republican: PartyVotes;
  independent: PartyVotes;
  total: { yea: number; nay: number; present: number; notVoting: number };
  yeaPercent: number;
  nayPercent: number;
  presentPercent: number;
  notVotingPercent: number;
  rollNumber?: number; // ← add this
  members?: MemberVote[];
}

export interface FollowedOfficial {
  bioguideId: string;
  name: string;
  isSenator?: boolean;
  role?: string;
}

interface VoiceVote {
  date: string;
  text: string;
  chamber: string;
}

interface VotingCardProps {
  votes: VoteData[];
  voiceVotes?: VoiceVote[];
  isLoading?: boolean;
  followedOfficials?: FollowedOfficial[];
}

interface MemberVote {
  firstName: string;
  lastName: string;
  party: string;
  vote: string;
}

const STATE_TO_ABBR: Record<string, string> = {
  Alabama: "AL",
  Alaska: "AK",
  Arizona: "AZ",
  Arkansas: "AR",
  California: "CA",
  Colorado: "CO",
  Connecticut: "CT",
  Delaware: "DE",
  Florida: "FL",
  Georgia: "GA",
  Hawaii: "HI",
  Idaho: "ID",
  Illinois: "IL",
  Indiana: "IN",
  Iowa: "IA",
  Kansas: "KS",
  Kentucky: "KY",
  Louisiana: "LA",
  Maine: "ME",
  Maryland: "MD",
  Massachusetts: "MA",
  Michigan: "MI",
  Minnesota: "MN",
  Mississippi: "MS",
  Missouri: "MO",
  Montana: "MT",
  Nebraska: "NE",
  Nevada: "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  Ohio: "OH",
  Oklahoma: "OK",
  Oregon: "OR",
  Pennsylvania: "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  Tennessee: "TN",
  Texas: "TX",
  Utah: "UT",
  Vermont: "VT",
  Virginia: "VA",
  Washington: "WA",
  "West Virginia": "WV",
  Wisconsin: "WI",
  Wyoming: "WY",
};

const extractStateAbbr = (role: string): string => {
  const dotMatch = role.match(/·\s*([^,]+)/);
  const fullState = dotMatch
    ? dotMatch[1].trim()
    : (role.match(/(?:Representative|Senator),\s*([^,]+)/)?.[1]?.trim() ?? "");
  return STATE_TO_ABBR[fullState] ?? fullState;
};

const PartyBar = ({
  label,
  total,
  dem,
  rep,
  ind,
  percent,
  demCount,
  repCount,
  indCount,
}: {
  label: string;
  total: number;
  dem: number;
  rep: number;
  ind: number;
  percent: number;
  demCount: number;
  repCount: number;
  indCount: number;
}) => (
  <View style={{ gap: 6, marginBottom: 12 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={[componentStyles.detailInfo, { color: "#000" }]}>
        {label} ({total})
      </Text>
      <Text style={[componentStyles.detailInfo, { color: "#7B7C81" }]}>
        {percent}%
      </Text>
    </View>
    <View
      style={{
        height: 24,
        backgroundColor: "#E5E7EB",
        borderRadius: 6,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${dem}%`,
          backgroundColor: "#008CFF",
          position: "absolute",
          left: 0,
        }}
      />
      <View
        style={{
          height: "100%",
          width: `${rep}%`,
          backgroundColor: "#D45252",
          position: "absolute",
          left: `${dem}%`,
        }}
      />
      <View
        style={{
          height: "100%",
          width: `${ind}%`,
          backgroundColor: "#FAEA70",
          position: "absolute",
          left: `${dem + rep}%`,
        }}
      />
    </View>
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Text style={{ fontSize: 11, color: "#008CFF" }}>D: {demCount}</Text>
      <Text style={{ fontSize: 11, color: "#D45252" }}>R: {repCount}</Text>
      {indCount > 0 && (
        <Text style={{ fontSize: 11, color: "#9B8500" }}>I: {indCount}</Text>
      )}
    </View>
  </View>
);

const extractState = (role: string): string => {
  const dotMatch = role.match(/·\s*([^,]+)/);
  if (dotMatch) return dotMatch[1].trim();
  const commaMatch = role.match(/(?:Representative|Senator),\s*([^,]+)/);
  return commaMatch ? commaMatch[1].trim() : "";
};

const SingleVoteCard = ({
  vote,
  followedOfficials,
  onSeeAll,
}: {
  vote: VoteData;
  followedOfficials?: FollowedOfficial[];
  onSeeAll: () => void;
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const grandTotal =
    vote.total.yea +
      vote.total.nay +
      vote.total.present +
      vote.total.notVoting || 1;

  const demYeaPct = Math.round((vote.democratic.yea / grandTotal) * 100);
  const repYeaPct = Math.round((vote.republican.yea / grandTotal) * 100);
  const indYeaPct = Math.round((vote.independent.yea / grandTotal) * 100);

  const demNayPct = Math.round((vote.democratic.nay / grandTotal) * 100);
  const repNayPct = Math.round((vote.republican.nay / grandTotal) * 100);
  const indNayPct = Math.round((vote.independent.nay / grandTotal) * 100);

  const demPresPct = Math.round((vote.democratic.present / grandTotal) * 100);
  const repPresPct = Math.round((vote.republican.present / grandTotal) * 100);

  const demNVPct = Math.round((vote.democratic.notVoting / grandTotal) * 100);
  const repNVPct = Math.round((vote.republican.notVoting / grandTotal) * 100);

  const resultColor =
    vote.result?.toLowerCase().includes("pass") ||
    vote.result?.toLowerCase().includes("agreed")
      ? "#16a34a"
      : vote.result?.toLowerCase().includes("fail") ||
          vote.result?.toLowerCase().includes("rejected")
        ? "#dc2626"
        : "#535353";

  return (
    <View style={[componentStyles.section, { gap: 12 }]}>
      {/* Header */}
      <View style={{ gap: 4 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={[componentStyles.detailTitle, { fontSize: 15 }]}>
            {vote.chamber} ·{" "}
            {new Date(vote.date).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })}
          </Text>
          {vote.members && vote.members.length > 0 && (
            <Pressable
              onPress={onSeeAll}
              style={({ pressed }) => ({
                backgroundColor: "#fafafa",
                borderColor: "#7B7C81",
                borderWidth: 1,
                paddingVertical: screenWidth < 390 ? 5 : 8,
                paddingHorizontal: screenWidth < 390 ? 8 : 14,
                borderRadius: 8,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={{
                  fontSize: screenWidth < 390 ? 11 : 13,
                  color: "#1a1a1a",
                  fontWeight: "600",
                }}
              >
                See all votes ({vote.members.length})
              </Text>
            </Pressable>
          )}
        </View>
        {vote.question || vote.result
          ? (() => {
              const embeddedMatch = vote.result?.match(/\(([^)]+)\)/);
              const resultText = vote.result
                ?.replace(/\s*\([^)]+\)/, "")
                .trim();
              const voteCount = embeddedMatch
                ? embeddedMatch[1]
                : `${vote.total.yea}-${vote.total.nay}`;
              const displayResult = `${resultText} (${voteCount})`;
              return (
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: resultColor,
                  }}
                >
                  {[vote.question, displayResult].filter(Boolean).join(" · ")}
                </Text>
              );
            })()
          : null}
      </View>

      {/* Followed officials callout */}
      {followedOfficials &&
        followedOfficials.length > 0 &&
        vote.members &&
        vote.members.length > 0 &&
        (() => {
          const matches = followedOfficials.flatMap((official) => {
            const hasComma = official.name.includes(",");
            const lastName = hasComma
              ? official.name.split(",")[0].trim()
              : official.name.split(" ").slice(-1)[0].trim();
            const firstName = hasComma
              ? (official.name.split(",")[1]?.split(" ")[0] ?? "").trim()
              : official.name.split(" ")[0].trim();
            const isSenateVote = vote.chamber?.toLowerCase() === "senate";
            if (official.isSenator && !isSenateVote) return [];

            const match = vote.members!.find((m) => {
              const memberLastName = m.lastName
                .replace(/\s*\([^)]+\)$/, "")
                .trim();
              const lastNameMatch =
                memberLastName.toLowerCase() === lastName.toLowerCase();
              if (!lastNameMatch) return false;
              if (m.firstName === "") return true;
              return (
                firstName === "" ||
                m.firstName.toLowerCase().startsWith(firstName.toLowerCase())
              );
            });
            if (!match) return [];
            const cleanLastName = match.lastName
              .replace(/\s*\([^)]+\)$/, "")
              .trim();
            const stateAbbr = extractStateAbbr(official.role ?? "");
            return [
              {
                name: `${cleanLastName}${stateAbbr ? ` (${stateAbbr})` : ""}`,
                vote: match.vote,
                party: match.party,
                state: stateAbbr,
              },
            ];
          });
          if (matches.length === 0) return null;
          return (
            <View
              style={{
                backgroundColor: "#F0F7FF",
                borderRadius: 8,
                padding: 10,
                marginVertical: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: "#535353",
                  marginBottom: 6,
                }}
              >
                Your followed officials
              </Text>
              {matches.map((m, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 2,
                  }}
                >
                  <Text style={{ fontSize: 13, color: "#1a1a1a" }}>
                    {m.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color:
                        m.vote === "Yea" || m.vote === "Aye"
                          ? "#16a34a"
                          : m.vote === "Nay" || m.vote === "No"
                            ? "#dc2626"
                            : "#535353",
                    }}
                  >
                    {m.vote}
                  </Text>
                </View>
              ))}
            </View>
          );
        })()}

      {/* Bars */}
      <PartyBar
        label="Yea"
        total={vote.total.yea}
        dem={demYeaPct}
        rep={repYeaPct}
        ind={indYeaPct}
        percent={vote.yeaPercent}
        demCount={vote.democratic.yea}
        repCount={vote.republican.yea}
        indCount={vote.independent.yea}
      />
      <PartyBar
        label="Nay"
        total={vote.total.nay}
        dem={demNayPct}
        rep={repNayPct}
        ind={indNayPct}
        percent={vote.nayPercent}
        demCount={vote.democratic.nay}
        repCount={vote.republican.nay}
        indCount={vote.independent.nay}
      />
      {vote.total.present > 0 && (
        <PartyBar
          label="Present"
          total={vote.total.present}
          dem={demPresPct}
          rep={repPresPct}
          ind={0}
          percent={vote.presentPercent}
          demCount={vote.democratic.present}
          repCount={vote.republican.present}
          indCount={vote.independent.present}
        />
      )}
      <PartyBar
        label="Not Voting"
        total={vote.total.notVoting}
        dem={demNVPct}
        rep={repNVPct}
        ind={0}
        percent={vote.notVotingPercent}
        demCount={vote.democratic.notVoting}
        repCount={vote.republican.notVoting}
        indCount={vote.independent.notVoting}
      />

      {/* Legend */}
      <View style={{ flexDirection: "row", gap: 16, marginTop: 4 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: "#008CFF",
            }}
          />
          <Text style={{ fontSize: 11, color: "#535353" }}>Democrat</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: "#D45252",
            }}
          />
          <Text style={{ fontSize: 11, color: "#535353" }}>Republican</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              backgroundColor: "#FAEA70",
            }}
          />
          <Text style={{ fontSize: 11, color: "#535353" }}>Independent</Text>
        </View>
      </View>
    </View>
  );
};

const VotingCard: React.FC<VotingCardProps> = ({
  votes,
  voiceVotes = [],
  isLoading,
  followedOfficials,
}) => {
  const [selectedVote, setSelectedVote] = useState<VoteData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  if (isLoading) {
    return (
      <View style={{ padding: 40, alignItems: "center" }}>
        <LoadingSpinner />
        <Text style={{ color: "#7B7C81", marginTop: 24 }}>
          Loading vote data...
        </Text>
      </View>
    );
  }

  if (!votes || votes.length === 0) {
    return (
      <View>
        {voiceVotes.length > 0 ? (
          <>
            {voiceVotes.map((vv, i) => (
              <View key={i} style={[componentStyles.section, { gap: 6 }]}>
                <Text style={[componentStyles.detailTitle, { fontSize: 14 }]}>
                  {[
                    vv.chamber,
                    vv.date
                      ? new Date(vv.date + "T12:00:00").toLocaleDateString(
                          "en-US",
                          {
                            month: "2-digit",
                            day: "2-digit",
                            year: "numeric",
                          },
                        )
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                <Text
                  style={[componentStyles.detailInfo, { color: "#535353" }]}
                >
                  {vv.text}
                </Text>
              </View>
            ))}
            <Text
              style={{
                fontSize: 12,
                color: "#7B7C81",
                textAlign: "center",
                marginTop: 24,
              }}
            >
              No roll call vote was recorded for this bill.
            </Text>
          </>
        ) : (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: "#7B7C81" }}>
              No voting information available.
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View>
      {votes.map((vote, i) => (
        <SingleVoteCard
          key={`${vote.chamber}-${vote.rollNumber ?? i}`}
          vote={vote}
          followedOfficials={followedOfficials}
          onSeeAll={() => setSelectedVote(vote)}
        />
      ))}
      {/* Full vote list modal */}
      <Modal
        visible={selectedVote !== null}
        animationType="slide"
        onRequestClose={() => setSelectedVote(null)}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: "#fafafa" }}>
          {/* Header */}
          <View
            style={{
              paddingTop: 56,
              paddingHorizontal: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: "#f0f0f0",
              gap: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "700", color: "#1a1a1a" }}
              >
                {selectedVote?.chamber} ·{" "}
                {selectedVote?.date
                  ? new Date(selectedVote.date).toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })
                  : ""}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedVote(null);
                  setSearchQuery("");
                }}
              >
                <Text style={{ fontSize: 15, color: "#008CFF" }}>Done</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search by name..."
              placeholderTextColor="#7B7C81"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                backgroundColor: "#f0f0f0",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 15,
                color: "#1a1a1a",
              }}
            />
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
            {selectedVote?.members &&
              (() => {
                const query = searchQuery.toLowerCase();
                const filtered = selectedVote.members.filter(
                  (m) =>
                    query === "" ||
                    m.firstName.toLowerCase().includes(query) ||
                    m.lastName.toLowerCase().includes(query),
                );

                const groups: {
                  label: string;
                  color: string;
                  members: typeof filtered;
                }[] = [
                  {
                    label: "Yea",
                    color: "#16a34a",
                    members: filtered.filter(
                      (m) => m.vote === "Yea" || m.vote === "Aye",
                    ),
                  },
                  {
                    label: "Nay",
                    color: "#dc2626",
                    members: filtered.filter(
                      (m) => m.vote === "Nay" || m.vote === "No",
                    ),
                  },
                  {
                    label: "Present",
                    color: "#535353",
                    members: filtered.filter((m) => m.vote === "Present"),
                  },
                  {
                    label: "Not Voting",
                    color: "#7B7C81",
                    members: filtered.filter(
                      (m) => m.vote === "Not Voting" || m.vote === "Absent",
                    ),
                  },
                ].filter((g) => g.members.length > 0);

                return groups.map((group) => (
                  <View key={group.label} style={{ marginTop: 16 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: group.color,
                        paddingHorizontal: 16,
                        marginBottom: 4,
                      }}
                    >
                      {group.label} ({group.members.length})
                    </Text>
                    {group.members.map((m, i) => {
                      const isSenateVote =
                        selectedVote?.chamber?.toLowerCase() === "senate";
                      const isFollowed = followedOfficials?.some((o) => {
                        if (o.isSenator && !isSenateVote) return false;
                        const hasComma = o.name.includes(",");
                        const oLastName = hasComma
                          ? o.name.split(",")[0].trim()
                          : o.name.split(" ").slice(-1)[0].trim();
                        const memberLastName = m.lastName
                          .replace(/\s*\([^)]+\)$/, "")
                          .trim();
                        if (
                          memberLastName.toLowerCase() !==
                          oLastName.toLowerCase()
                        )
                          return false;

                        // If member row already has a state abbr in lastName, use it to disambiguate
                        const memberStateMatch =
                          m.lastName.match(/\(([A-Z]{2})\)$/);
                        if (memberStateMatch) {
                          const memberState = memberStateMatch[1];
                          const followedState = extractStateAbbr(o.role ?? "");
                          return memberState === followedState;
                        }

                        // Fall back to first name prefix match
                        if (m.firstName === "") return true;
                        const oFirstName = hasComma
                          ? (o.name.split(",")[1]?.split(" ")[0] ?? "").trim()
                          : o.name.split(" ")[0].trim();
                        return (
                          oFirstName === "" ||
                          m.firstName
                            .toLowerCase()
                            .startsWith(oFirstName.toLowerCase())
                        );
                      });
                      return (
                        <View
                          key={i}
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: "#f0f0f0",
                            backgroundColor: isFollowed
                              ? "#F0F7FF"
                              : "transparent",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            {(() => {
                              const cleanLast = m.lastName
                                .replace(/\s*\([^)]+\)$/, "")
                                .trim();
                              const alreadyHasState = /\([A-Z]{2}\)$/.test(
                                m.lastName.trim(),
                              );

                              // Find the matched followed official for state
                              const matchedFollowed = followedOfficials?.find(
                                (o) => {
                                  const hasComma = o.name.includes(",");
                                  const oLastName = hasComma
                                    ? o.name.split(",")[0].trim()
                                    : o.name.split(" ").slice(-1)[0].trim();
                                  return (
                                    oLastName.toLowerCase() ===
                                    cleanLast.toLowerCase()
                                  );
                                },
                              );
                              const stateAbbr = matchedFollowed
                                ? extractStateAbbr(matchedFollowed.role ?? "")
                                : "";

                              const displayName = alreadyHasState
                                ? [m.firstName, m.lastName]
                                    .filter(Boolean)
                                    .join(" ")
                                : stateAbbr
                                  ? `${[m.firstName, cleanLast].filter(Boolean).join(" ")} (${stateAbbr})`
                                  : [m.firstName, m.lastName]
                                      .filter(Boolean)
                                      .join(" ");

                              return (
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#1a1a1a",
                                    fontWeight: isFollowed ? "600" : "400",
                                  }}
                                >
                                  {displayName}
                                </Text>
                              );
                            })()}
                          </View>
                          <Text style={{ fontSize: 12, color: "#7B7C81" }}>
                            {m.party === "D"
                              ? "D"
                              : m.party === "R"
                                ? "R"
                                : m.party === "I"
                                  ? "I"
                                  : m.party}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ));
              })()}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

export default VotingCard;
