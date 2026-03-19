import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { useOnboarding } from "../context/OnboardingContext";
import { billsService } from "../services/bills";
import { getDb } from "../utils/database";
import { notificationPreferences } from "../utils/notificationPreferences";
import { storage } from "../utils/storage";
import { syncPreferencesToBackend } from "../utils/syncPreferences";

const SUGGESTED_OFFICIALS = [
  {
    bioguideId: "O000172",
    name: "Alexandria Ocasio-Cortez",
    party: "D",
    role: "Representative",
    state: "NY",
    district: "14",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/O/O000172.jpg",
  },
  {
    bioguideId: "S000033",
    name: "Bernie Sanders",
    party: "I",
    role: "Senator",
    state: "VT",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/S/S000033.jpg",
  },
  {
    bioguideId: "M000355",
    name: "Mitch McConnell",
    party: "R",
    role: "Senator",
    state: "KY",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/M/M000355.jpg",
  },
  {
    bioguideId: "J000299",
    name: "Mike Johnson",
    party: "R",
    role: "Representative",
    state: "LA",
    district: "4",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/J/J000299.jpg",
  },
  {
    bioguideId: "J000294",
    name: "Hakeem Jeffries",
    party: "D",
    role: "Representative",
    state: "NY",
    district: "8",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/J/J000294.jpg",
  },
  {
    bioguideId: "C001098",
    name: "Ted Cruz",
    party: "R",
    role: "Senator",
    state: "TX",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/C/C001098.jpg",
  },
  {
    bioguideId: "P000603",
    name: "Rand Paul",
    party: "R",
    role: "Senator",
    state: "KY",
    photoUrl: "https://bioguide.congress.gov/bioguide/photo/P/P000603.jpg",
  },
];

const SUGGESTED_BILLS = [
  {
    id: "hr22",
    type: "HR",
    number: "22",
    title: "SAVE Act",
    policyArea: "Government Operations and Politics",
    updateDate: "2025-04-09",
    latestAction: "Received in the Senate.",
  },
  {
    id: "hr7148",
    type: "HR",
    number: "7148",
    title: "Consolidated Appropriations Act, 2026",
    policyArea: "Economics and Public Finance",
    updateDate: "2026-02-02",
    latestAction: "Became Public Law no: 119-75.",
  },
  {
    id: "hr3633",
    type: "HR",
    number: "3633",
    title: "Digital Asset Market Clarity Act of 2025",
    policyArea: "Finance and Financial Sector",
    updateDate: "2025-06-10",
    latestAction: "Referred to the Committee on Financial Services.",
  },
  {
    id: "hr7894",
    type: "HR",
    number: "7894",
    title: "Truman Scholarship Clean House Act",
    policyArea: "Education",
    updateDate: "2025-04-22",
    latestAction: "Referred to the House Committee on Education.",
  },
  {
    id: "s2563",
    type: "S",
    number: "2563",
    title: "Global Investment in American Jobs Act of 2025",
    policyArea: "Government Operations and Politics",
    updateDate: "2025-05-14",
    latestAction: "Read twice and referred to the Committee on Commerce.",
  },
  {
    id: "hr2709",
    type: "HR",
    number: "2709",
    title: "Save Our Sequoias Act",
    policyArea: "Environmental Protection",
    updateDate: "2025-02-28",
    latestAction: "Referred to the Subcommittee on National Parks.",
  },
  {
    id: "hr398",
    type: "HR",
    number: "398",
    title: "Geothermal Cost-Recovery Authority Act",
    policyArea: "Energy",
    updateDate: "2025-01-20",
    latestAction: "Referred to the House Committee on Natural Resources.",
  },
  {
    id: "s3718",
    type: "S",
    number: "3718",
    title: "Delivering for Rural Seniors Act of 2026",
    policyArea: "Agriculture and Food",
    updateDate: "2026-01-08",
    latestAction: "Read twice and referred to the Committee on Agriculture.",
  },
];

export default function FinishScreen() {
  const router = useRouter();
  const {
    selectedOfficials,
    selectedBills,
    selectedPolicyAreas,
    priorityState,
    listName,
    setOverlayConfig,
  } = useOnboarding();
  const hasRun = useRef(false);

  const [msgIndex, setMsgIndex] = useState(0);
  const messages = [
    "Just a moment...",
    "Loading legislation data for the first time...",
    "This only happens once...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setOverlayConfig(null);
  }, []);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const finish = async () => {
      try {
        // 1. Build list items from selections
        const items: any[] = [];

        const STATE_ABBR: Record<string, string> = {
          AL: "Alabama",
          AK: "Alaska",
          AZ: "Arizona",
          AR: "Arkansas",
          CA: "California",
          CO: "Colorado",
          CT: "Connecticut",
          DE: "Delaware",
          FL: "Florida",
          GA: "Georgia",
          HI: "Hawaii",
          ID: "Idaho",
          IL: "Illinois",
          IN: "Indiana",
          IA: "Iowa",
          KS: "Kansas",
          KY: "Kentucky",
          LA: "Louisiana",
          ME: "Maine",
          MD: "Maryland",
          MA: "Massachusetts",
          MI: "Michigan",
          MN: "Minnesota",
          MS: "Mississippi",
          MO: "Missouri",
          MT: "Montana",
          NE: "Nebraska",
          NV: "Nevada",
          NH: "New Hampshire",
          NJ: "New Jersey",
          NM: "New Mexico",
          NY: "New York",
          NC: "North Carolina",
          ND: "North Dakota",
          OH: "Ohio",
          OK: "Oklahoma",
          OR: "Oregon",
          PA: "Pennsylvania",
          RI: "Rhode Island",
          SC: "South Carolina",
          SD: "South Dakota",
          TN: "Tennessee",
          TX: "Texas",
          UT: "Utah",
          VT: "Vermont",
          VA: "Virginia",
          WA: "Washington",
          WV: "West Virginia",
          WI: "Wisconsin",
          WY: "Wyoming",
        };

        for (const bioguideId of selectedOfficials) {
          const official = SUGGESTED_OFFICIALS.find(
            (o) => o.bioguideId === bioguideId,
          );
          if (official) {
            const fullState = STATE_ABBR[official.state] ?? official.state;
            const roleLabel =
              official.role === "Senator"
                ? `Senator · ${fullState}`
                : `Representative · ${fullState}${official.district ? `, District ${official.district}` : ""}`;
            items.push({
              id: official.bioguideId,
              type: "official",
              name: official.name,
              party: official.party,
              role: roleLabel,
              photoUrl: official.photoUrl,
              update: "",
            });
          }
        }

        // 3. Save priority state
        if (priorityState) {
          storage.setPriorityState(priorityState);
          notificationPreferences.enable(`state_${priorityState}`, "official");
        }

        // 4. Save policy area notification preferences
        if (selectedPolicyAreas.length > 0) {
          notificationPreferences.saveSubTypes(
            "policy_areas",
            "bill",
            selectedPolicyAreas,
          );
        }

        // 5. Sync preferences to backend
        await syncPreferencesToBackend();

        // 6. Pre-populate SQLite with bills so the tour doesn't stall
        try {
          await billsService.getAll();
        } catch (error) {
          console.error("Bills prefetch failed:", error);
          // Non-fatal — app will retry when legislation tab loads
        }

        for (const billId of selectedBills) {
          const bill = SUGGESTED_BILLS.find((b) => b.id === billId);
          if (bill) {
            // Look up live data from SQLite (populated in step 6)
            const db = getDb();
            const row = db.getFirstSync<{
              latest_action_text: string | null;
              latest_action_date: string | null;
            }>(
              `SELECT latest_action_text, latest_action_date FROM bills WHERE bill_id = ?`,
              [bill.id],
            );
            items.push({
              id: bill.id,
              type: "bill",
              name: bill.title,
              policyArea: bill.policyArea,
              date: row?.latest_action_date ?? bill.updateDate ?? "",
              latestAction: row?.latest_action_text ?? bill.latestAction ?? "",
              update: "",
            });
          }
        }

        // 2. Create the list
        const allLists = storage.getLists();
        const name = listName.trim() || "My List";
        const existingDefault = allLists.find(
          (l) => l.name === "My List" && l.items.length === 0,
        );

        if (existingDefault && items.length > 0) {
          // Rename and populate the default empty list
          existingDefault.name = name;
          existingDefault.items = items;
          storage.saveLists(allLists);
        } else {
          // Create a new list
          const newList = {
            id: Date.now().toString(),
            name,
            items,
          };
          allLists.push(newList);
          storage.saveLists(allLists);
        }

        // 7. Mark onboarding complete
        const db = getDb();
        db.runSync(
          `INSERT INTO meta (key, value) VALUES ('onboarding_complete', 'true')
           ON CONFLICT(key) DO UPDATE SET value = 'true'`,
        );

        // 8. Navigate to tour
        router.replace("/onboarding/tour" as any);
      } catch (error) {
        console.error("Error finishing onboarding:", error);
        // Even on error, mark complete and proceed
        try {
          const db = getDb();
          db.runSync(
            `INSERT INTO meta (key, value) VALUES ('onboarding_complete', 'true')
             ON CONFLICT(key) DO UPDATE SET value = 'true'`,
          );
        } catch {}
        router.replace("/onboarding/tour" as any);
      }
    };

    finish();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fafafa",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#1a1a1a",
          marginBottom: 12,
        }}
      >
        Building your list...
      </Text>
      <Text style={{ fontSize: 15, color: "#535353" }}>
        {messages[msgIndex]}
      </Text>
    </View>
  );
}
