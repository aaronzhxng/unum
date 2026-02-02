import React from "react";
import { Image, Text, View } from "react-native";
import { styles as componentStyles } from "../styles/components";

type Party = "Democrat" | "Republican" | "Independent";
type PartyVotes = { democrat: number; republican: number; independent: number };

interface Vote {
  name: string;
  party: string;
  role: string;
  vote: any;
  photo: any;
}

interface VotingCardProps {
  chamberDate: string;
  votes: {
    yea: number;
    yeaByParty: PartyVotes;
    nay: number;
    nayByParty: PartyVotes;
    notVoting: number;
    yeaPercent: number;
    nayPercent: number;
    notVotingPercent: number;
    voters: Vote[];
  };
}

const VotingCard: React.FC<VotingCardProps> = ({ chamberDate, votes }) => {
  const partyColors: Record<Party, string> = {
    Democrat: "#3B82F6",
    Republican: "#DC2626",
    Independent: "#9CA3AF",
  };

  const PartyBar: React.FC<{
    partyVotes: PartyVotes;
    total: number;
    label: string;
    percent: number;
  }> = ({ partyVotes, total, label, percent }) => {
    const partyColors: Record<Party, string> = {
      // ← Move INSIDE PartyBar
      Democrat: "#3B82F6",
      Republican: "#DC2626",
      Independent: "#9CA3AF",
    };

    return (
      <>
        <View style={componentStyles.detailTitleRow}>
          <Text style={[componentStyles.detailInfo, { color: "#000000" }]}>
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
            flexDirection: "row",
          }}
        >
          {(["Democrat", "Republican", "Independent"] as Party[]).map(
            (party) => {
              const partyCount = (partyVotes as any)[party] as number;
              const widthPercent = (partyCount / total) * 100;
              if (widthPercent > 0) {
                return (
                  // ← CRITICAL: Missing return was culprit
                  <View
                    key={party}
                    style={{
                      height: "100%",
                      width: `${widthPercent}%`,
                      backgroundColor: partyColors[party],
                    }}
                  />
                );
              }
              return null;
            },
          )}
        </View>
      </>
    );
  };

  return (
    <View
      style={[
        componentStyles.section,
        { padding: 16, marginBottom: 16, gap: 16 },
      ]}
    >
      <Text
        style={[
          componentStyles.detailTitle,
          { fontSize: 16, fontWeight: "600" },
        ]}
      >
        {chamberDate}
      </Text>

      {votes.voters.map((voter, index) => (
        <View
          key={index}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <Image
            source={voter.photo}
            style={[
              componentStyles.avatar,
              {
                width: 54,
                height: 54,
                borderRadius: 36,
                borderWidth: 3,
                borderColor: "#008CFF",
              },
            ]}
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text
              style={[
                componentStyles.detailTitle,
                { fontSize: 16, fontWeight: "600" },
              ]}
            >
              {voter.name}
            </Text>
            <Text
              style={[
                componentStyles.detailInfo,
                { fontSize: 12, color: "#7B7C81" },
              ]}
            >
              {`${voter.party} · ${voter.role}`}
            </Text>
          </View>
          <Text
            style={[
              componentStyles.detailTitle,
              {
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#7B7C81",
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 4,
              },
            ]}
          >
            {voter.vote}
          </Text>
        </View>
      ))}

      <View style={{ gap: 16 }}>
        <PartyBar
          partyVotes={votes.yeaByParty}
          total={votes.yea}
          label="Yea"
          percent={votes.yeaPercent}
        />
        <PartyBar
          partyVotes={votes.nayByParty}
          total={votes.nay}
          label="Nay"
          percent={votes.nayPercent}
        />
        <View style={componentStyles.detailTitleRow}>
          <Text style={[componentStyles.detailInfo, { color: "#000000" }]}>
            Not Voting ({votes.notVoting})
          </Text>
          <Text style={[componentStyles.detailInfo, { color: "#7B7C81" }]}>
            {votes.notVotingPercent}%
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
              width: `${votes.notVotingPercent}%`,
              backgroundColor: "#9CA3AF",
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default VotingCard;
