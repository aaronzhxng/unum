import { Clock, X } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  history: string[];
  onPick: (query: string) => void;
  onRemove: (query: string) => void;
  onClear: () => void;
}

/** The list of recent searches shown before anything is typed */
export default function RecentSearches({
  history,
  onPick,
  onRemove,
  onClear,
}: Props) {
  if (!history.length) return null;
  return (
    <View style={{ marginTop: 16, marginHorizontal: 16 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            letterSpacing: 0.8,
            color: "#7B7C81",
          }}
        >
          RECENT SEARCHES
        </Text>
        <Pressable
          onPress={onClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear recent searches"
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#008CFF" }}>
            Clear
          </Text>
        </Pressable>
      </View>
      {history.map((query) => (
        <View
          key={query}
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderBottomWidth: 1,
            borderBottomColor: "#ececec",
          }}
        >
          <Pressable
            onPress={() => onPick(query)}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 12,
              opacity: pressed ? 0.5 : 1,
            })}
          >
            <Clock size={16} color="#7B7C81" />
            <Text style={{ flex: 1, fontSize: 16, color: "#0d0d0d" }} numberOfLines={1}>
              {query}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => onRemove(query)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${query} from recent searches`}
            style={({ pressed }) => ({ padding: 4, opacity: pressed ? 0.5 : 1 })}
          >
            <X size={16} color="#B0B0B5" />
          </Pressable>
        </View>
      ))}
    </View>
  );
}
