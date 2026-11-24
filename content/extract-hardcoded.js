/**
 * Extracts hardcoded topic data from app/education_tab/content.ts
 * and generates .md files for every subtopic.
 *
 * Usage:  node content/extract-hardcoded.js
 */

const fs = require("fs");
const path = require("path");

const CONTENT_TS = path.join(__dirname, "..", "app", "education_tab", "content.ts");
const TOPICS_DIR = path.join(__dirname, "topics");

const SRC = fs.readFileSync(CONTENT_TS, "utf-8");

// ── Step 1: Extract the hardcodedTopics array ────────────────────────────
// Find the hardcodedTopics array — extract from the `[` after the declaration
const startMarker = "const hardcodedTopics: EducationTopic[] = ";
const startIdx = SRC.indexOf(startMarker);
if (startIdx === -1) throw new Error("Could not find hardcodedTopics");

// Extract starting from the `[`
let src = SRC.substring(startIdx + startMarker.length);
const endMarker = "\n// ── Load Markdown-based content";
const endIdx = src.indexOf(endMarker);
if (endIdx === -1) throw new Error("Could not find end of hardcodedTopics");
src = src.substring(0, endIdx);

// Step 2: Transform TypeScript → JavaScript
// Remove type annotations
src = src.replace(/: EducationTopic\[\]/g, "");
src = src.replace(/: EducationTopic/g, "");
src = src.replace(/: EducationSubtopic\[\]/g, "");
src = src.replace(/: EducationSubtopic/g, "");
src = src.replace(/: EducationSection\[\]/g, "");
src = src.replace(/: EducationSection/g, "");
src = src.replace(/: any/g, "");
src = src.replace(/: string/g, "");
src = src.replace(/: boolean/g, "");
src = src.replace(/: number/g, "");
src = src.replace(/: {[^}]+}/g, "");

// Replace require() calls with filename string
src = src.replace(/require\("([^"]+)"\)/g, (_, p) => JSON.stringify(path.basename(p)));

// Make it evaluable
src = "const hardcodedTopics = " + src + "; module.exports = hardcodedTopics;";

// Write temp file and require it
const TMP_FILE = path.join(__dirname, "_temp_hardcoded.js");
fs.writeFileSync(TMP_FILE, src, "utf-8");

let hardcodedTopics;
try {
  hardcodedTopics = require(TMP_FILE);
} catch (e) {
  console.error("Failed to eval:", e.message);
  console.error("Check " + TMP_FILE);
  process.exit(1);
}

// Clean up
fs.unlinkSync(TMP_FILE);

// ── Step 3: Generate .md files ───────────────────────────────────────────
const TOPICS_WITH_MD = new Set(["how-government-works"]); // already done

const sectionToMarkdown = (sec) => {
  switch (sec.type) {
    case "text": {
      const lines = [];
      if (sec.heading) lines.push("\n## " + sec.heading + "\n");
      lines.push(sec.content);
      return lines.join("\n");
    }
    case "image": {
      const caption = sec.caption ? sec.caption : "";
      return `\n![${caption}](${sec.source})\n`;
    }
    case "callout": {
      const h = sec.heading ? "**" + sec.heading + "** " : "";
      return "\n> " + h + sec.content + "\n";
    }
    case "list": {
      return "\n" + sec.items.map((item) => "- " + item).join("\n") + "\n";
    }
    case "links": {
      return "\n" + sec.items.map((item) => "- [" + item.label + "](" + item.url + ")").join("\n") + "\n";
    }
    default:
      return "";
  }
};

hardcodedTopics.forEach((topic) => {
  const topicDir = path.join(TOPICS_DIR, topic.id);

  // Skip if already has .md files
  if (TOPICS_WITH_MD.has(topic.id)) {
    console.log("Skipping " + topic.id + " (already has .md files)");
    return;
  }

  // Ensure topic directory exists
  fs.mkdirSync(topicDir, { recursive: true });

  topic.subtopics.forEach((sub, idx) => {
    const num = String(idx + 1).padStart(2, "0");
    const filename = num + "-" + sub.id + ".md";
    const filePath = path.join(topicDir, filename);

    const frontmatter = [
      "---",
      "title: " + sub.title,
      "summary: " + sub.summary,
      "---",
    ].join("\n");

    const body = sub.body.map(sectionToMarkdown).join("\n\n").replace(/\n{3,}/g, "\n\n").trim();

    const md = frontmatter + "\n\n" + body + "\n";
    fs.writeFileSync(filePath, md, "utf-8");
    console.log("  Wrote " + topic.id + "/" + filename);
  });
});

console.log("\nDone! Generated .md files for " + hardcodedTopics.filter(t => !TOPICS_WITH_MD.has(t.id) && t.subtopics.length > 0).length + " topics.");
