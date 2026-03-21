import React from "react";
import { Text, View } from "react-native";
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

interface FollowedOfficial {
  bioguideId: string;
  name: string; // "Last, First" format
}

interface VotingCardProps {
  votes: VoteData[];
  isLoading?: boolean;
  followedOfficials?: FollowedOfficial[];
}

interface MemberVote {
  firstName: string;
  lastName: string;
  party: string;
  vote: string;
}

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

const SingleVoteCard = ({
  vote,
  followedOfficials,
}: {
  vote: VoteData;
  followedOfficials?: FollowedOfficial[];
}) => {
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
      {/* Followed officials callout */}
      {followedOfficials &&
        followedOfficials.length > 0 &&
        vote.members &&
        vote.members.length > 0 &&
        (() => {
          const matches = followedOfficials.flatMap((official) => {
            // Convert "Last, First" to first/last
            const parts = official.name.split(",").map((s) => s.trim());
            const lastName = parts[0] ?? "";
            const firstName = parts[1]?.split(" ")[0] ?? "";

            const match = vote.members!.find(
              (m) =>
                m.lastName.toLowerCase() === lastName.toLowerCase() &&
                (firstName === "" ||
                  m.firstName
                    .toLowerCase()
                    .startsWith(firstName.toLowerCase())),
            );

            if (!match) return [];
            return [
              {
                name: `${match.firstName} ${match.lastName}`,
                vote: match.vote,
                party: match.party,
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
                marginBottom: 4,
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
                Your officials
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
                        m.vote === "Yea"
                          ? "#16a34a"
                          : m.vote === "Nay"
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
      {/* Header */}
      <View style={{ gap: 4 }}>
        <Text style={[componentStyles.detailTitle, { fontSize: 15 }]}>
          {vote.chamber} ·{" "}
          {new Date(vote.date).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })}
        </Text>
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
  isLoading,
  followedOfficials,
}) => {
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
      <View style={{ padding: 40, alignItems: "center" }}>
        <Text style={{ color: "#7B7C81" }}>
          No recorded votes for this bill.
        </Text>
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
        />
      ))}
    </View>
  );
};

export default VotingCard;
