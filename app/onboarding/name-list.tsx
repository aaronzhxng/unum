// import { useFocusEffect } from "@react-navigation/native";
// import { useRouter } from "expo-router";
// import React, { useRef } from "react";
// import {
//   KeyboardAvoidingView,
//   Platform,
//   Pressable,
//   Text,
//   TextInput,
//   View,
// } from "react-native";
// import { useOnboarding } from "../context/OnboardingContext";

// export default function NameListScreen() {
//   const router = useRouter();
//   const {
//     listName,
//     setListName,
//     selectedOfficials,
//     selectedBills,
//     setOverlayConfig,
//   } = useOnboarding();
//   const inputRef = useRef<TextInput>(null);

//   const totalItems = selectedOfficials.length + selectedBills.length;

//   useFocusEffect(
//     React.useCallback(() => {
//       setOverlayConfig({
//         dotIndex: 5,
//         continueLabel: "Build My List",
//         onContinue: () => {
//           if (!listName.trim()) return;
//           router.push("/onboarding/finish" as any);
//         },
//         onBack: () => router.back(),
//         continueDisabled: !listName.trim(),
//       });
//     }, [listName]),
//   );

//   return (
//     <KeyboardAvoidingView
//       style={{ flex: 1, backgroundColor: "#fafafa" }}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//     >
//       <View
//         style={{ paddingTop: 64, paddingHorizontal: 24, paddingBottom: 24 }}
//       >
//         <Text
//           style={{
//             fontSize: 24,
//             fontWeight: "700",
//             color: "#1a1a1a",
//             marginBottom: 8,
//             marginTop: 32,
//           }}
//         >
//           Name your list
//         </Text>
//         <Text style={{ fontSize: 15, color: "#535353", lineHeight: 22 }}>
//           {totalItems > 0
//             ? `Your ${totalItems} selected item${totalItems > 1 ? "s" : ""} will be added to this list.`
//             : "Give your first list a name to get started."}
//         </Text>
//       </View>

//       <View style={{ paddingHorizontal: 24, flex: 1 }}>
//         <Pressable
//           onPress={() => inputRef.current?.focus()}
//           style={{
//             backgroundColor: "#fff",
//             borderRadius: 24,
//             padding: 16,
//             shadowColor: "#000000",
//             shadowOpacity: 0.15,
//             shadowOffset: { width: 0, height: 2 },
//             shadowRadius: 4,
//             elevation: 2,
//           }}
//         >
//           <TextInput
//             ref={inputRef}
//             value={listName}
//             onChangeText={setListName}
//             placeholder="e.g. My List, Politics 2026, Watch List..."
//             placeholderTextColor="#aaa"
//             style={{ fontSize: 16, color: "#1a1a1a", padding: 0 }}
//             autoFocus
//             maxLength={40}
//             returnKeyType="done"
//             onSubmitEditing={() => {
//               if (!listName.trim()) return;
//               router.push("/onboarding/finish" as any);
//             }}
//           />
//         </Pressable>

//         <Text
//           style={{
//             fontSize: 12,
//             color: "#aaa",
//             textAlign: "right",
//             marginTop: 6,
//           }}
//         >
//           {listName.length}/40
//         </Text>

//         {totalItems > 0 && (
//           <View
//             style={{
//               backgroundColor: "#E8F4FF",
//               borderRadius: 12,
//               padding: 14,
//               marginTop: 24,
//             }}
//           >
//             <Text style={{ fontSize: 13, color: "#008CFF", fontWeight: "600" }}>
//               What's going in your list:
//             </Text>
//             {selectedOfficials.length > 0 && (
//               <Text style={{ fontSize: 13, color: "#535353", marginTop: 6 }}>
//                 · {selectedOfficials.length} official
//                 {selectedOfficials.length > 1 ? "s" : ""}
//               </Text>
//             )}
//             {selectedBills.length > 0 && (
//               <Text style={{ fontSize: 13, color: "#535353", marginTop: 4 }}>
//                 · {selectedBills.length} bill
//                 {selectedBills.length > 1 ? "s" : ""}
//               </Text>
//             )}
//           </View>
//         )}
//       </View>
//     </KeyboardAvoidingView>
//   );
// }
