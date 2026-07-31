/**
 * Markdown → JSON converter for education content.
 *
 * Reads .md files from content/topics/<topic-id>/<nn>-<slug>.md,
 * parses frontmatter + custom markdown, and writes:
 *   content/generated/education-content.json
 *
 * Usage:  node content/convert.js
 *
 * Markdown format:
 *   ---
 *   title: ...
 *   summary: ...
 *   ---
 *
 *   ## Heading         → text section (with heading)
 *   Paragraph text     → text section content
 *   ![caption](path)   → image section
 *   > **head** body    → callout section
 *   > body             → callout section (no heading)
 *   - item             → list section item
 *   - [label](url)     → links section item
 */

const fs = require("fs");
const path = require("path");

const TOPICS_DIR = path.join(__dirname, "topics");
const OUT_DIR = path.join(__dirname, "generated");
const OUT_FILE = path.join(OUT_DIR, "education-content.json");

slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

parseFrontmatter = (raw) => {
  const meta = { title: "", summary: "" };
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { meta, body: raw };
  m[1].split("\n").forEach((line) => {
    const sep = line.indexOf(":");
    if (sep > 0) {
      const key = line.slice(0, sep).trim();
      const val = line.slice(sep + 1).trim();
      if (key === "title" || key === "summary") meta[key] = val;
      if (key === "icon") meta[key] = val;
    }
  });
  return { meta, body: raw.slice(m[0].length).trim() };
};

isLinkItem = (line) => /^\s*-\s*\[([^\]]+)\]\(([^)]+)\)/.test(line);
isListItem = (line) => /^\s*-\s+(?!\[)/.test(line);
isImage = (line) => /^!\[([^\]]*)\]\(([^)]+)\)/.test(line);
isCallout = (line) => /^>\s?/.test(line);

parseCalloutLine = (line) => {
  const text = line.replace(/^>\s?/, "").trim();
  const m = text.match(/^\*\*(.+?)\*\*:?\s*(.*)/);
  if (m) return { heading: m[1], content: m[2] };
  const m2 = text.match(/^\*\*(.+?)\*\*\s+(.*)/);
  if (m2) return { heading: m2[1], content: m2[2] };
  return { heading: undefined, content: text };
};

parseBody = (raw) => {
  const sections = [];
  const lines = raw.split("\n");
  const linkItems = [];
  let listItems = [];
  let calloutBuffer = null;
  let textBuffer = null;
  let pendingHeading = null;

  const flushText = () => {
    if (textBuffer === null && pendingHeading === null) return;
    // Don't flush if we have a heading but no content yet — wait for the next paragraph
    if (pendingHeading && (textBuffer === null || textBuffer.trim() === "")) {
      textBuffer = null;
      return;
    }
    sections.push({
      type: "text",
      ...(pendingHeading ? { heading: pendingHeading } : {}),
      content: (textBuffer || "").trim(),
    });
    textBuffer = null;
    pendingHeading = null;
  };

  const flushCallout = () => {
    if (calloutBuffer) {
      sections.push({ type: "callout", ...calloutBuffer });
      calloutBuffer = null;
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      sections.push({ type: "list", items: [...listItems] });
      listItems = [];
    }
  };

  const flushLinks = () => {
    if (linkItems.length > 0) {
      sections.push({ type: "links", items: [...linkItems] });
      linkItems.length = 0;
    }
  };

  const flushAll = () => {
    flushText();
    flushCallout();
    flushList();
    flushLinks();
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // Empty line separates blocks
      flushAll();
      continue;
    }

    // Heading
    if (/^## /.test(trimmed)) {
      flushAll();
      pendingHeading = trimmed.replace(/^## /, "").trim();
      textBuffer = "";
      continue;
    }

    // Image
    if (isImage(trimmed)) {
      flushAll();
      const m = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
      sections.push({
        type: "image",
        source: path.basename(m[2]),
        ...(m[1] ? { caption: m[1] } : {}),
      });
      continue;
    }

    // Callout
    if (isCallout(trimmed)) {
      flushText();
      const parsed = parseCalloutLine(trimmed);
      if (calloutBuffer) {
        // multi-line callout — append content
        calloutBuffer.content += (calloutBuffer.content ? "\n" : "") + parsed.content;
        if (parsed.heading && !calloutBuffer.heading) calloutBuffer.heading = parsed.heading;
      } else {
        calloutBuffer = parsed;
      }
      continue;
    }

    // Link item
    if (isLinkItem(trimmed)) {
      flushText();
      flushCallout();
      flushList();
      const m = trimmed.match(/^\s*-\s*\[([^\]]+)\]\(([^)]+)\)/);
      linkItems.push({ label: m[1], url: m[2] });
      continue;
    }

    // List item
    if (isListItem(trimmed)) {
      flushText();
      flushCallout();
      flushLinks();
      const text = trimmed.replace(/^\s*-\s+/, "");
      listItems.push(text);
      continue;
    }

    // Regular text
    flushCallout();
    flushList();
    flushLinks();
    if (textBuffer === null) {
      textBuffer = trimmed;
    } else {
      textBuffer += "\n" + trimmed;
    }
  }

  flushAll();

  // Post-process: merge consecutive text sections without headings
  const merged = [];
  for (const s of sections) {
    if (
      s.type === "text" &&
      !s.heading &&
      merged.length > 0 &&
      merged[merged.length - 1].type === "text" &&
      !merged[merged.length - 1].heading
    ) {
      merged[merged.length - 1].content += "\n\n" + s.content;
    } else {
      merged.push(s);
    }
  }

  return merged;
};

readTopicDir = (dir) => {
  const topicId = path.basename(dir);
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const subtopics = files.map((file) => {
    const raw = fs.readFileSync(path.join(dir, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);
    const subId = file.replace(/^\d+-/, "").replace(/\.md$/, "");
    return {
      id: slugify(subId),
      title: meta.title || subId.replace(/-/g, " "),
      summary: meta.summary || "",
      icon: meta.icon || "",
      body: parseBody(body),
    };
  });

  return { id: topicId, subtopics };
};

// Read topic metadata from topic directories
buildContent = () => {
  const topicDirs = fs
    .readdirSync(TOPICS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const topics = topicDirs.map((dirName) => {
    const dir = path.join(TOPICS_DIR, dirName);
    const data = readTopicDir(dir);

    // Try to read topic-level metadata
    const metaPath = path.join(dir, "metadata.json");
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try {
        meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      } catch (_) {}
    }

    return {
      id: data.id,
      title: meta.title || data.id.replace(/-/g, " "),
      subtitle: meta.subtitle || "",
      icon: meta.icon || "",
      subtopics: data.subtopics,
    };
  });

  return { topics };
};

// Main
const content = buildContent();
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(content, null, 2), "utf-8");
console.log(`✓ Written ${OUT_FILE}`);
console.log(`  ${content.topics.length} topics, ${content.topics.reduce((s, t) => s + t.subtopics.length, 0)} subtopics`);
