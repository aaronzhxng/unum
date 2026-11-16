import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { Text, TextStyle, View } from "react-native";

// Cards in one FitGroup share a version: if one card needs "Rep, Texas, 12",
// every card in its group shows that form, so a list reads consistently
const GroupContext = createContext<{
  levels: Record<string, number>;
  report: (group: string, card: string, level: number) => void;
} | null>(null);

export function FitGroup({
  children,
  enabled = true,
}: {
  children: React.ReactNode;
  // When false, each card fits its own line
  enabled?: boolean;
}) {
  // Each card's latest choice. A card that measures again replaces its
  // earlier choice, so one early reading can't shorten the whole list.
  const [choices, setChoices] = useState<
    Record<string, Record<string, number>>
  >({});
  const report = useCallback(
    (group: string, card: string, level: number) =>
      setChoices((prev) =>
        prev[group]?.[card] === level
          ? prev
          : { ...prev, [group]: { ...prev[group], [card]: level } },
      ),
    [],
  );
  const levels = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [group, cards] of Object.entries(choices)) {
      out[group] = Math.max(0, ...Object.values(cards));
    }
    return out;
  }, [choices]);
  const value = useMemo(() => ({ levels, report }), [levels, report]);
  return (
    <GroupContext.Provider value={enabled ? value : null}>
      {children}
    </GroupContext.Provider>
  );
}

/**
 * Shows the first of several versions of a line that fits on one line, such
 * as a role written out in full and then abbreviated step by step. Every
 * version is measured out of sight and compared with the space available,
 * so the choice never depends on what happens to be showing. The last
 * version is shown whatever its length, cut short with "…".
 *
 * Takes the rest of its row, so it belongs last in one.
 */
export default function FitText({
  options,
  group,
  style,
}: {
  options: string[];
  // Cards in the same FitGroup with the same group share a version
  group?: string;
  style?: TextStyle | TextStyle[];
}) {
  const ctx = useContext(GroupContext);
  const card = useId();
  const [space, setSpace] = useState<number | null>(null);
  // Natural width of each version, by its text
  const [widths, setWidths] = useState<Record<string, number>>({});

  // A width of 0 is the row before it has been laid out, not its real room
  const measured =
    !!space && options.every((o) => widths[o] != null && widths[o] > 0);
  const own = measured
    ? (() => {
        // A little to spare: Android needs slightly more room to draw a
        // line than it measures, and cuts it short with "…" otherwise
        const i = options.findIndex((o) => widths[o] <= space - 3);
        return i === -1 ? options.length - 1 : i;
      })()
    : null;

  const { report } = ctx ?? {};
  useEffect(() => {
    if (own != null && group && report) report(group, card, own);
  }, [own, group, report, card]);

  const shared = group && ctx ? (ctx.levels[group] ?? 0) : 0;
  const shown = Math.min(Math.max(own ?? 0, shared), options.length - 1);

  return (
    <View
      style={{ flex: 1, minWidth: 0, overflow: "hidden" }}
      onLayout={(e) => setSpace(e.nativeEvent.layout.width)}
    >
      <Text style={style} numberOfLines={1} ellipsizeMode="tail">
        {options[shown]}
      </Text>
      {/* Every version at its natural width, out of sight */}
      <View
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 2000,
          opacity: 0,
          alignItems: "flex-start",
        }}
      >
        {options.map((o) => (
          <Text
            key={o}
            style={style}
            numberOfLines={1}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width;
              setWidths((prev) => (prev[o] === w ? prev : { ...prev, [o]: w }));
            }}
          >
            {o}
          </Text>
        ))}
      </View>
    </View>
  );
}
