import * as Updates from "expo-updates";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function UpdateToast() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    const checkForUpdate = async () => {
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          setUpdateAvailable(true);
        }
      } catch {
        // Silently fail — update checking shouldn't break the app
      }
    };
    checkForUpdate();
  }, []);

  if (!updateAvailable) return null;

  return (
    <View
      style={{
        position: "absolute",
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 9999,
      }}
    >
      <Text style={{ fontSize: 14, color: "#fff", fontWeight: "500", flex: 1 }}>
        Update available
      </Text>
      <Pressable
        onPress={async () => {
          setIsReloading(true);
          await Updates.reloadAsync();
        }}
        style={({ pressed }) => ({
          backgroundColor: "#008CFF",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          transform: [{ scale: pressed ? 0.96 : 1 }],
          marginLeft: 12,
        })}
      >
        <Text style={{ fontSize: 13, color: "#fff", fontWeight: "600" }}>
          {isReloading ? "Relaunching..." : "Relaunch"}
        </Text>
      </Pressable>
    </View>
  );
}
