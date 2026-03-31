import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { styles as componentStyles } from "../global_styles/styles";

interface Props {
  visible: boolean;
  onClose: () => void;
  screen: string; // pass in which screen it came from
}

type Status = "idle" | "loading" | "success" | "error";

export default function ReportErrorModal({ visible, onClose, screen }: Props) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(
        "https://unum-production.up.railway.app/report-error",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, screen }),
        },
      );
      if (!res.ok) throw new Error();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleClose = () => {
    setMessage("");
    setStatus("idle");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <Pressable style={componentStyles.modalOverlay} onPress={handleClose}>
          <Pressable onPress={() => {}} style={componentStyles.subModalCard}>
            {status === "success" ? (
              // Success state
              <View style={{ alignItems: "center", paddingVertical: 8 }}>
                <Text style={{ fontSize: 24, marginBottom: 12 }}>✓</Text>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Report Submitted
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#7B7C81",
                    textAlign: "center",
                    lineHeight: 20,
                    marginBottom: 24,
                  }}
                >
                  Thank you for making Unum a better app.
                </Text>
                <Pressable
                  onPress={handleClose}
                  style={({ pressed }) => ({
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  })}
                >
                  <View style={componentStyles.actionRow}>
                    <Text
                      style={{
                        fontSize: 15,
                        color: "#008CFF",
                        fontWeight: "600",
                        marginBottom: 16,
                      }}
                    >
                      Done
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : (
              // Input state
              <>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: 6,
                  }}
                >
                  Report an Error
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: "#7B7C81",
                    marginBottom: 16,
                    lineHeight: 18,
                  }}
                >
                  Describe what went wrong and we'll look into it.
                </Text>

                <TextInput
                  style={{
                    borderWidth: 1,
                    borderColor: "#e0e0e0",
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                    color: "#1a1a1a",
                    minHeight: 100,
                    textAlignVertical: "top",
                    marginBottom: 8,
                  }}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="e.g. Vote count looks wrong on H.R. 1234..."
                  placeholderTextColor="#adb5bd"
                  multiline
                  autoFocus
                />

                {status === "error" && (
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#FF3B30",
                      marginBottom: 8,
                    }}
                  >
                    Something went wrong. Please try again.
                  </Text>
                )}

                <View style={componentStyles.actionRow}>
                  <Pressable
                    style={({ pressed }) => [
                      componentStyles.actionButton,
                      { transform: pressed ? [{ scale: 0.96 }] : [] },
                    ]}
                    onPress={handleClose}
                  >
                    <Text style={{ fontSize: 16, color: "#535353" }}>
                      Cancel
                    </Text>
                  </Pressable>

                  <View style={componentStyles.verticalDivider} />

                  <Pressable
                    style={({ pressed }) => [
                      componentStyles.actionButton,
                      { transform: pressed ? [{ scale: 0.96 }] : [] },
                      !message.trim() && { opacity: 0.4 },
                    ]}
                    onPress={handleSubmit}
                    disabled={!message.trim() || status === "loading"}
                  >
                    {status === "loading" ? (
                      <ActivityIndicator size="small" color="#008CFF" />
                    ) : (
                      <Text
                        style={{
                          fontSize: 16,
                          color: "#008CFF",
                          fontWeight: "600",
                        }}
                      >
                        Submit
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
