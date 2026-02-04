import React from "react";
import { Image, Text, View } from "react-native";
import { styles as componentStyles } from "../styles/components"; // Adjust path if needed

interface Vote {
  name: string;
  role: string;
  party: string;
  vote: "Yea" | "Nay" | "Not Voting";
  photo: any;
}

interface VotingCardProps {
  chamberDate: string;
  votes: {
    yea: number;
    yeaDem: number;
    yeaRep: number;
    yeaInd: number;
    nay: number;
    nayDem: number;
    nayRep: number;
    nayInd: number;
    present: number;
    presentDem: number;
    presentRep: number;
    presentInd: number;
    notVoting: number;
    notVotingDem: number;
    notVotingRep: number;
    notVotingInd: number;
    yeaPercent: number;
    nayPercent: number;
    presentPercent: number;
    notVotingPercent: number;
    voters: Vote[];
  };
}

const VotingCard: React.FC<VotingCardProps> = ({ chamberDate, votes }) => {
  const dummyData = {
    chamberDate: "US Senate - 2/27/25",
    votes: {
      yea: 52,
      yeaDem: 20,
      yeaRep: 31,
      yeaInd: 1,
      nay: 47,
      nayDem: 45,
      nayRep: 1,
      nayInd: 1,
      present: 0,
      presentDem: 0,
      presentRep: 0,
      presentInd: 0,
      notVoting: 1,
      notVotingDem: 1,
      notVotingRep: 1,
      notVotingInd: 1,
      yeaPercent: 50,
      nayPercent: 47,
      presentPercent: 0,
      notVotingPercent: 1,
      voters: [
        {
          name: "Chuck Schumer",
          party: "D",
          role: "Majority Leader, Senator, NY",
          vote: "Nay" as const,
          photo: require("../../../assets/officials_images/c_schumer.jpg"), // Add your assets
        },
        {
          name: "Kirsten Gillibrand",
          party: "D",
          role: "Senator, New York",
          vote: "Nay" as const,
          photo: require("../../../assets/officials_images/k_gillibrand.webp"), // Add your assets
        },
      ],
    },
  };

  return (
    <View style={[componentStyles.section, { marginBottom: 4, gap: 16 }]}>
      {/* Header */}
      <Text
        style={[componentStyles.detailTitle, { fontSize: 16, fontWeight: 600 }]}
      >
        {dummyData.chamberDate}
      </Text>

      {/* Voters List */}
      {dummyData.votes.voters.map((voter, index) => (
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
                width: 60,
                height: 60,
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
                { fontSize: 16, fontWeight: 600 },
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

      {/* Progress Bars */}
      <View style={{ gap: 16 }}>
        <View style={componentStyles.detailTitleRow}>
          <Text style={[componentStyles.detailInfo, { color: "#000000" }]}>
            Yea ({dummyData.votes.yea})
          </Text>
          <Text style={[componentStyles.detailInfo, { color: "#7B7C81" }]}>
            {dummyData.votes.yeaPercent}%
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
              width: `${dummyData.votes.yeaDem}%`,
              backgroundColor: "#008CFF",
              position: "absolute",
              left: 0,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.yeaRep}%`,
              backgroundColor: "#D45252",
              position: "absolute",
              left: `${dummyData.votes.yeaDem}%`,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.yeaInd}%`,
              backgroundColor: "#FFE627",
              position: "absolute",
              left: `${dummyData.votes.yeaDem + dummyData.votes.yeaRep}%`,
            }}
          />
        </View>

        <View style={componentStyles.detailTitleRow}>
          <Text style={[componentStyles.detailInfo, { color: "#000000" }]}>
            Nay ({dummyData.votes.nay})
          </Text>
          <Text style={[componentStyles.detailInfo, { color: "#7B7C81" }]}>
            {dummyData.votes.nayPercent}%
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
              width: `${dummyData.votes.nayDem}%`,
              backgroundColor: "#008CFF",
              position: "absolute",
              left: 0,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.nayRep}%`,
              backgroundColor: "#D45252",
              position: "absolute",
              left: `${dummyData.votes.nayDem}%`,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.yeaInd}%`,
              backgroundColor: "#FFE627",
              position: "absolute",
              left: `${dummyData.votes.nayDem + dummyData.votes.nayRep}%`,
            }}
          />
        </View>

        <View style={componentStyles.detailTitleRow}>
          <Text style={[componentStyles.detailInfo, { color: "#000000" }]}>
            Present ({dummyData.votes.present})
          </Text>
          <Text style={[componentStyles.detailInfo, { color: "#7B7C81" }]}>
            {dummyData.votes.presentPercent}%
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
              width: `${dummyData.votes.presentDem}%`,
              backgroundColor: "#008CFF",
              position: "absolute",
              left: 0,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.presentRep}%`,
              backgroundColor: "#D45252",
              position: "absolute",
              left: `${dummyData.votes.presentDem}%`,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.presentInd}%`,
              backgroundColor: "#FFE627",
              position: "absolute",
              left: `${dummyData.votes.presentDem + dummyData.votes.presentRep}%`,
            }}
          />
        </View>

        <View style={componentStyles.detailTitleRow}>
          <Text style={[componentStyles.detailInfo, { color: "#000000" }]}>
            Not Voting ({dummyData.votes.notVoting})
          </Text>
          <Text style={[componentStyles.detailInfo, { color: "#7B7C81" }]}>
            {dummyData.votes.notVotingPercent}%
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
              width: `${dummyData.votes.notVotingDem}%`,
              backgroundColor: "#008CFF",
              position: "absolute",
              left: 0,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.notVotingRep}%`,
              backgroundColor: "#D45252",
              position: "absolute",
              left: `${dummyData.votes.notVotingDem}%`,
            }}
          />
          <View
            style={{
              height: "100%",
              width: `${dummyData.votes.notVotingInd}%`,
              backgroundColor: "#FFE627",
              position: "absolute",
              left: `${dummyData.votes.notVotingDem + dummyData.votes.notVotingRep}%`,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default VotingCard;
