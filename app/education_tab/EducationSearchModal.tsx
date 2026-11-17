import { ChevronLeft } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  Pressable,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Modal from "react-native-modal";
import RecentSearches from "../global_components/RecentSearches";
import { styles as componentStyles } from "../global_styles/styles";
import { useSearchHistory } from "../utils/searchHistory";
import {
  EducationSection,
  EducationSubtopic,
  EducationTopic,
  visibleEducationTopics,
} from "./content";
import { stripMarks } from "./glossary";

const SHORT_SCREEN = Dimensions.get("window").height < 750;

// Words in nearly every article, ignored unless they're all that was typed
const FILLER = new Set(
  "a an and are can do does for how in is it of on or the to what when who why".split(
    " ",
  ),
);

type Article = {
  topic: EducationTopic;
  subtopic: EducationSubtopic;
  // Lowercased, for matching
  title: string;
  summary: string;
  body: string;
  // As written, for the snippet under a result
  bodyText: string;
};

// Everything a reader sees in an article body, as one block of text
const sectionText = (section: EducationSection): string =>
  stripMarks(rawSectionText(section));
const rawSectionText = (section: EducationSection): string => {
  switch (section.type) {
    case "text":
    case "callout":
      return [section.heading, section.content].filter(Boolean).join("\n");
    case "list":
      return section.items.join("\n");
    case "links":
      return [section.heading, ...section.items.map((i) => i.label)]
        .filter(Boolean)
        .join("\n");
    case "image":
      return section.caption ?? "";
  }
};

const ARTICLES: Article[] = visibleEducationTopics.flatMap((topic) =>
  topic.subtopics.map((subtopic) => {
    const bodyText = subtopic.body.map(sectionText).join("\n");
    return {
      topic,
      subtopic,
      title: subtopic.title.toLowerCase(),
      summary: subtopic.summary.toLowerCase(),
      body: bodyText.toLowerCase(),
      bodyText,
    };
  }),
);

// Every word has to appear somewhere in the article. Matches in the title
// count most, then the summary, the topic's name and the body.
const score = (a: Article, query: string, words: string[]): number => {
  const topic = a.topic.title.toLowerCase();
  const everywhere = `${a.title}\n${a.summary}\n${topic}\n${a.body}`;
  if (!words.every((w) => everywhere.includes(w))) return 0;
  let n = 0;
  if (a.title === query) n += 200;
  else if (a.title.startsWith(query)) n += 150;
  else if (a.title.includes(query)) n += 120;
  for (const w of words) {
    if (a.title.includes(w)) n += 40;
    if (a.summary.includes(w)) n += 20;
    if (topic.includes(w)) n += 10;
    // A few points per mention in the body, up to a limit
    n += Math.min(10, a.body.split(w).length - 1) * 2;
  }
  return n;
};

// The sentence around the first match in the body, so a result shows why it
// matched. Null when only the title or summary matched.
const snippet = (a: Article, words: string[]): string | null => {
  const at = Math.min(
    ...words.map((w) => a.body.indexOf(w)).filter((i) => i >= 0),
  );
  if (!Number.isFinite(at)) return null;
  const start = Math.max(0, a.bodyText.lastIndexOf(" ", Math.max(0, at - 50)));
  const endSpace = a.bodyText.indexOf(" ", at + 110);
  const end = endSpace < 0 ? a.bodyText.length : endSpace;
  return (
    (start > 0 ? "…" : "") +
    a.bodyText.slice(start, end).replace(/\s+/g, " ").trim() +
    (end < a.bodyText.length ? "…" : "")
  );
};

// Bolds every matched word in a line of text
function Highlighted({
  text,
  words,
  style,
  numberOfLines,
}: {
  text: string;
  words: string[];
  style: any;
  numberOfLines?: number;
}) {
  const pattern = words
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const parts = pattern ? text.split(new RegExp(`(${pattern})`, "gi")) : [text];
  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, i) =>
        i % 2 ? (
          <Text key={i} style={{ fontWeight: "700", color: "#0d0d0d" }}>
            {part}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  // Called instead of onClose when an article opens, so the search can come
  // back as it was when the reader returns
  onNavigatingAway: () => void;
  onOpenArticle: (topicId: string, subtopicId: string) => void;
  query: string;
  onQueryChange: (query: string) => void;
  skipEntryAnimation?: boolean;
}

/**
 * Searches the education articles by title, summary and text. Before
 * anything is typed it shows every article, topic by topic, as an index.
 */
export default function EducationSearchModal({
  isVisible,
  onClose,
  onNavigatingAway,
  onOpenArticle,
  query,
  onQueryChange,
  skipEntryAnimation = false,
}: Props) {
  const inputRef = useRef<TextInput>(null);
  const history = useSearchHistory("education");
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    if (!isVisible || skipEntryAnimation) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  const trimmed = debounced.toLowerCase().trim();
  const words = useMemo(() => {
    const all = trimmed.split(/\s+/).filter(Boolean);
    const meaningful = all.filter((w) => !FILLER.has(w));
    return meaningful.length ? meaningful : all;
  }, [trimmed]);
  const results = useMemo(
    () =>
      ARTICLES.map((a) => ({ a, n: score(a, trimmed, words) }))
        .filter((r) => r.n > 0)
        .sort((x, y) => y.n - x.n)
        .map((r) => r.a),
    [trimmed, words],
  );

  const handleClose = () => {
    Keyboard.dismiss();
    onQueryChange("");
    onClose();
  };

  const open = (a: Article) => {
    Keyboard.dismiss();
    history.add(query);
    onOpenArticle(a.topic.id, a.subtopic.id);
    onNavigatingAway();
  };

  if (!isVisible) return null;

  const sections = words.length
    ? [{ key: "results", title: "", data: results }]
    : visibleEducationTopics.map((topic) => ({
        key: topic.id,
        title: topic.title,
        data: ARTICLES.filter((a) => a.topic.id === topic.id),
      }));

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => {}}
      onBackButtonPress={handleClose}
      style={{ margin: 0 }}
      backdropOpacity={1}
      backdropColor="#fff"
      animationIn="slideInRight"
      animationOut="slideOutRight"
      animationInTiming={skipEntryAnimation ? 1 : 250}
      animationOutTiming={200}
      statusBarTranslucent
      useNativeDriver
      coverScreen
    >
      <View
        style={[
          componentStyles.container,
          { paddingBottom: SHORT_SCREEN ? 48 : 96 },
        ]}
      >
        <View style={componentStyles.headerBar}>
          <TouchableOpacity
            onPress={handleClose}
            accessibilityLabel="Close search"
            style={{ marginRight: 8, paddingHorizontal: 4 }}
          >
            <ChevronLeft size={24} color="#535353" />
          </TouchableOpacity>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderColor: "#bfbfbf",
              borderWidth: 1,
              borderRadius: 100,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <TextInput
              ref={inputRef}
              style={{
                flex: 1,
                fontSize: 16,
                color: "#212529",
                paddingVertical: 0,
              }}
              placeholder="Search articles"
              placeholderTextColor="#adb5bd"
              value={query}
              onChangeText={onQueryChange}
              returnKeyType="search"
              onSubmitEditing={() => {
                Keyboard.dismiss();
                history.add(query);
              }}
              autoCorrect={false}
            />
          </View>
        </View>

        <SectionList
          sections={sections}
          keyExtractor={(a) => `${a.topic.id}/${a.subtopic.id}`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          ListHeaderComponent={
            <>
              {!words.length && (
                <RecentSearches
                  history={history.history}
                  onPick={onQueryChange}
                  onRemove={history.remove}
                  onClear={history.clear}
                />
              )}
              <Text
                style={[
                  componentStyles.subtitle,
                  { marginLeft: 16, marginTop: 16, marginBottom: 4 },
                ]}
              >
                {!words.length
                  ? `All ${ARTICLES.length} articles`
                  : results.length
                    ? `${results.length} article${results.length === 1 ? "" : "s"} for "${debounced.trim()}"`
                    : `No articles mention "${debounced.trim()}"`}
              </Text>
            </>
          }
          renderSectionHeader={({ section }) =>
            section.title ? (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  letterSpacing: 0.8,
                  color: "#008CFF",
                  marginTop: 20,
                  marginBottom: 6,
                  marginHorizontal: 16,
                }}
              >
                {section.title.toUpperCase()}
              </Text>
            ) : null
          }
          renderItem={({ item: a }) => {
            if (!words.length) {
              // The index: a plain list of titles under each topic
              return (
                <Pressable
                  onPress={() => open(a)}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    marginHorizontal: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: "#ececec",
                    opacity: pressed ? 0.5 : 1,
                  })}
                >
                  <Text style={{ fontSize: 16, color: "#0d0d0d" }}>
                    {a.subtopic.title}
                  </Text>
                </Pressable>
              );
            }
            const line = snippet(a, words);
            return (
              <Pressable
                onPress={() => open(a)}
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}
              >
                <View
                  style={[
                    componentStyles.officialCard,
                    { paddingVertical: 14 },
                  ]}
                >
                  <View
                    style={{
                      width: 56,
                      marginRight: 12,
                      flexShrink: 0,
                      alignItems: "center",
                    }}
                  >
                    <Image
                      source={a.subtopic.icon ?? a.topic.icon}
                      style={{ width: 44, height: 44 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        letterSpacing: 0.6,
                        color: "#008CFF",
                        marginBottom: 2,
                      }}
                      numberOfLines={1}
                    >
                      {a.topic.title.toUpperCase()}
                    </Text>
                    <Highlighted
                      text={a.subtopic.title}
                      words={words}
                      style={componentStyles.name}
                    />
                    <Highlighted
                      text={line ?? a.subtopic.summary}
                      words={words}
                      style={[componentStyles.subtitle, { marginTop: 4 }]}
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}
