// Narrated short videos: still photos of Washington and members with a slow
// push-in, bold on-screen text, data cards, a voiceover and word-by-word
// captions. 1080 x 1920, about 30 seconds, for TikTok, Reels and Shorts.
//
//   node social/video/video.mjs 2026-11-16-common-cents
//
// Each video is a script in scripts/: a list of beats, where each beat is one
// or two spoken sentences with a headline, a background photo and an optional
// card (a member, a vote, a bill's stages, a coin, a number or a short list).
// The voice sets the timing: every beat lasts as long as its line takes to
// say, and the captions follow the words.
//
// Voices (VOICE=...):
//   say         (default) macOS's built-in voice, to test a script and the
//               look. Not for posting.
//   recorded    your own recordings, one file per beat:
//               social/video/recordings/<script>/1.m4a, 2.m4a, ... (m4a, mp3
//               or wav; Voice Memos works). Silence at either end is trimmed.
//   elevenlabs  ElevenLabs text to speech. Needs ELEVENLABS_API_KEY and
//               ELEVENLABS_VOICE_ID; gives exact word timings.
//
// Music: the standard track (unum-social-output/music/standard.mp3, now
// "Flash News") plays under every video, from its start, easing to half
// volume for the end card and fading out. MUSIC=path/to/track.mp3 uses
// another, MUSIC=none leaves it out. It's set to a fixed loudness (-24 LUFS,
// 10 below the voice); MUSIC_LEVEL=-20 makes it louder, -28 quieter.
// music-previews.mjs plays tracks under the voice to choose one.
//
// FIT=30 speeds the voice up, without changing its pitch, so the video ends
// within 30 seconds; it never speeds up by more than 1.25 times, and leaves
// a voice alone that already fits. SPEED=1.1 sets the speed directly.
//
// Output goes to unum-social-output/video/<script>/: the .mp4, cover.jpg (the
// first frame) and caption.txt (the post text with photo credits).
//
// Needs ffmpeg: FFMPEG_PATH, ffmpeg on the PATH, or
//   npm install --prefix ../unum-social-output/tools ffmpeg-static

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer";
import { esc, OUTPUT_ROOT, CHROME, LOGO, WORDMARK_CSS, wordmark } from "../prototypes/lib.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
// Photos come from the shared library (media/photos, listed in photos.json),
// named by their library ID like "capitol-dusk". Member portraits and the
// photos older scripts used stay in social/video/photos.
const LIBRARY = path.join(HERE, "..", "..", "media", "photos");
const PHOTOS = path.join(HERE, "photos");
const library = JSON.parse(fs.readFileSync(path.join(LIBRARY, "photos.json"), "utf8"));

const name = (process.argv[2] || "").replace(/\.mjs$/, "");
const scriptFile = path.join(HERE, "scripts", `${name}.mjs`);
if (!name || !fs.existsSync(scriptFile)) {
  const list = fs.readdirSync(path.join(HERE, "scripts")).map((f) => "  " + f.replace(/\.mjs$/, ""));
  throw new Error(`Usage: node social/video/video.mjs <script>\nScripts:\n${list.join("\n")}`);
}
const script = (await import(pathToFileURL(scriptFile).href)).default;
const OUT = path.join(OUTPUT_ROOT, "video", name);
fs.mkdirSync(path.join(OUT, "audio"), { recursive: true });

const FFMPEG =
  [process.env.FFMPEG_PATH, path.join(OUTPUT_ROOT, "tools", "node_modules", "ffmpeg-static", "ffmpeg")].find(
    (p) => p && fs.existsSync(p),
  ) || "ffmpeg";
if (!CHROME) throw new Error("No Chrome found; set CHROME_PATH");

const FPS = 30;
const W = 1080, H = 1920;
// Pauses around the voice, in seconds
const LEAD = 0.25, GAP = 0.3, TAIL = 1.0;
const VOICE = process.env.VOICE || "say";
// The standard track, unum-social-output/music/standard.mp3, plays under
// every video unless MUSIC names another track or is "none". Its credit for
// the caption, if any, is in standard.txt (or MUSIC_CREDIT).
const STANDARD = path.join(OUTPUT_ROOT, "music", "standard.mp3");
const MUSIC =
  process.env.MUSIC === "none" ? null : process.env.MUSIC || (fs.existsSync(STANDARD) ? STANDARD : null);
const MUSIC_CREDIT =
  process.env.MUSIC_CREDIT ??
  (MUSIC === STANDARD && fs.existsSync(STANDARD.replace(/\.mp3$/, ".txt"))
    ? fs.readFileSync(STANDARD.replace(/\.mp3$/, ".txt"), "utf8").trim()
    : "");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => reject(e.code === "ENOENT" ? new Error(`${cmd} not found`) : e));
    p.on("close", (code) => (code === 0 ? resolve({ out, err }) : reject(new Error(`${path.basename(cmd)}: ${err.slice(-1000)}`))));
  });
}

// Length of an audio file, by decoding it
async function duration(file) {
  const { err } = await run(FFMPEG, ["-hide_banner", "-i", file, "-f", "null", "-"]);
  const times = [...err.matchAll(/time=(\d+):(\d+):([\d.]+)/g)];
  if (!times.length) throw new Error(`Could not read the length of ${file}`);
  const [, h, m, s] = times.at(-1);
  return Number(h) * 3600 + Number(m) * 60 + Number(s);
}

// Trims silence from both ends and converts to 48 kHz mono
const TRIM =
  "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse";
const toWav = (input, output, trim = true) =>
  run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", "-i", input, ...(trim ? ["-af", TRIM] : []), "-ar", "48000", "-ac", "1", output]);

const rich = (s) => esc(s).replace(/\*(.+?)\*/g, "<mark>$1</mark>");
const photoFile = (name) => {
  if (path.isAbsolute(name)) return name;
  const found = [
    library[name] && path.join(LIBRARY, library[name].file),
    path.join(LIBRARY, name),
    path.join(PHOTOS, name),
  ].find((p) => p && fs.existsSync(p));
  if (!found) throw new Error(`No photo "${name}" in media/photos or social/video/photos`);
  return found;
};
const photoUrl = (name) => pathToFileURL(photoFile(name)).href;

// ---------------------------------------------------------------------------
// Voice and word timings
// ---------------------------------------------------------------------------

// Spreads a line's words across its length by how long each takes to say:
// letters, with numbers read out longer and a pause after punctuation
function estimate(words, dur) {
  const said = (w) => {
    const letters = w.replace(/[^\p{L}\p{N}]/gu, "").length;
    const digits = w.replace(/\D/g, "").length;
    return letters + digits * 2.5 + 2;
  };
  const pause = (w) => (/[.!?:]["”’)]*$/.test(w) ? 6 : /[,;—–]["”’)]*$/.test(w) ? 3.5 : 0);
  const total = words.reduce((n, w, i) => n + said(w) + (i < words.length - 1 ? pause(w) : 0), 0);
  let at = 0;
  return words.map((w) => {
    const start = (at / total) * dur;
    at += said(w);
    const end = (at / total) * dur;
    at += pause(w);
    return { w, start, end };
  });
}

// Where the speech is in a recording: when it starts and ends, and the pauses
// inside it. Loudness is averaged over 50 ms windows, so the odd crackle in
// room noise doesn't count as speech, and quiet is measured against the
// recording's own loudest moment. Pauses shorter than a breath between words
// don't count.
async function speechMap(file, dur) {
  const STEP = 0.05;
  const { err } = await run(FFMPEG, [
    "-hide_banner", "-i", file, "-af",
    `asetnsamples=${Math.round(48000 * STEP)},astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level`,
    "-f", "null", "-",
  ]);
  const rms = [...err.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === "-inf" ? -120 : Number(m[1])));
  if (!rms.length) return { start: 0, end: dur, pauses: [] };
  const quietBelow = Math.max(...rms) - 17;
  const loud = rms.map((r) => r >= quietBelow);
  const firstLoud = loud.indexOf(true), lastLoud = loud.lastIndexOf(true);
  if (firstLoud < 0) return { start: 0, end: dur, pauses: [] };
  const start = firstLoud * STEP, end = Math.min(dur, (lastLoud + 1) * STEP);
  const pauses = [];
  for (let k = firstLoud; k <= lastLoud; ) {
    if (loud[k]) { k++; continue; }
    let e = k;
    while (e <= lastLoud && !loud[e]) e++;
    if ((e - k) * STEP >= 0.15) pauses.push({ from: k * STEP, to: e * STEP });
    k = e;
  }
  return { start, end, pauses };
}

// Word timings for a line, pinned to its real pauses: each pause in the
// recording is matched, in order, to the comma or period it most likely
// falls at, and only the words between pauses are spread by length. So the
// captions catch up at every pause instead of drifting.
function alignToPauses(words, t0, t1, pauses) {
  const breakAfter = (w) => /[.,!?:;—–]["”’)]*$/.test(w);
  const guess = estimate(words, t1 - t0).map((w) => ({ ...w, start: w.start + t0, end: w.end + t0 }));
  // Each break between phrases, with when it would fall by length alone
  const breaks = [];
  words.forEach((w, i) => {
    if (i < words.length - 1 && breakAfter(w)) breaks.push({ after: i, at: (guess[i].end + guess[i + 1].start) / 2 });
  });
  const anchors = [];
  let next = 0;
  for (const b of breaks) {
    let best = -1;
    for (let k = next; k < pauses.length; k++) {
      const mid = (pauses[k].from + pauses[k].to) / 2;
      if (Math.abs(mid - b.at) > 1.2) continue;
      if (best < 0 || Math.abs(mid - b.at) < Math.abs((pauses[best].from + pauses[best].to) / 2 - b.at)) best = k;
    }
    if (best >= 0) {
      anchors.push({ after: b.after, from: pauses[best].from, to: pauses[best].to });
      next = best + 1;
    }
  }
  // Spread each run of words between anchors over its stretch of speech
  const out = [];
  let i = 0, t = t0;
  for (const a of [...anchors, { after: words.length - 1, from: t1, to: t1 }]) {
    const run = words.slice(i, a.after + 1);
    out.push(...estimate(run, Math.max(0.05, a.from - t)).map((w) => ({ ...w, start: w.start + t, end: w.end + t })));
    i = a.after + 1;
    t = a.to;
  }
  return out;
}

// Word timings from ElevenLabs' character alignment
function fromAlignment(text, words, al) {
  const out = [];
  let i = 0;
  for (const w of words) {
    const at = text.indexOf(w, i);
    if (at < 0) return null;
    i = at + w.length;
    out.push({ w, start: al.character_start_times_seconds[at], end: al.character_end_times_seconds[i - 1] });
  }
  return out;
}

async function elevenlabs(text, file, context) {
  const key = process.env.ELEVENLABS_API_KEY, voice = process.env.ELEVENLABS_VOICE_ID;
  if (!key || !voice) throw new Error("VOICE=elevenlabs needs ELEVENLABS_API_KEY and ELEVENLABS_VOICE_ID");
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "content-type": "application/json" },
    body: JSON.stringify({ text, model_id: process.env.ELEVENLABS_MODEL || "eleven_multilingual_v2", ...context }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const { audio_base64, alignment } = await res.json();
  fs.writeFileSync(file, Buffer.from(audio_base64, "base64"));
  return alignment;
}

// Makes beat i's audio (cached, so changing only the visuals re-renders fast)
// and returns { file, dur, words } with times from the start of the line
async function voiceFor(beat, i, beats) {
  const speak = beat.speak || beat.say;
  const words = beat.say.split(/\s+/).filter(Boolean);
  const dir = path.join(OUT, "audio");

  if (VOICE === "recorded") {
    const base = path.join(HERE, "recordings", name, String(i + 1));
    const src = [".m4a", ".mp3", ".wav", ".aiff"].map((e) => base + e).find((f) => fs.existsSync(f));
    if (!src) throw new Error(`No recording for beat ${i + 1}: expected ${base}.m4a (or .mp3, .wav)\n  "${beat.say}"`);
    // Cut to the speech, with a moment either side, then time the words
    const raw = path.join(dir, `${i + 1}-recorded-raw.wav`);
    await toWav(src, raw, false);
    const rawDur = await duration(raw);
    const map = await speechMap(raw, rawDur);
    const from = Math.max(0, map.start - 0.06), to = Math.min(rawDur, map.end + 0.18);
    const file = path.join(dir, `${i + 1}-recorded.wav`);
    await run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", "-i", raw, "-af", `atrim=${from.toFixed(3)}:${to.toFixed(3)},asetpts=PTS-STARTPTS`, file]);
    fs.rmSync(raw);
    const dur = to - from;
    const pauses = map.pauses.map((p) => ({ from: p.from - from, to: p.to - from }));
    return { file, dur, words: alignToPauses(words, map.start - from, map.end - from, pauses) };
  }

  const key = crypto.createHash("sha1").update(JSON.stringify([VOICE, process.env.SAY_VOICE, process.env.SAY_RATE, process.env.ELEVENLABS_VOICE_ID, speak])).digest("hex").slice(0, 10);
  const file = path.join(dir, `${i + 1}-${key}.wav`);
  const meta = file.replace(/\.wav$/, ".json");
  if (fs.existsSync(file) && fs.existsSync(meta)) return { file, ...JSON.parse(fs.readFileSync(meta, "utf8")) };

  let result;
  if (VOICE === "elevenlabs") {
    const mp3 = file.replace(/\.wav$/, ".mp3");
    const context = {
      previous_text: beats[i - 1] ? beats[i - 1].speak || beats[i - 1].say : undefined,
      next_text: beats[i + 1] ? beats[i + 1].speak || beats[i + 1].say : undefined,
    };
    const al = await elevenlabs(speak, mp3, context);
    await toWav(mp3, file, false);
    const dur = await duration(file);
    result = { dur, words: (speak === beat.say && fromAlignment(speak, words, al)) || estimate(words, dur) };
  } else if (VOICE === "say") {
    const aiff = file.replace(/\.wav$/, ".aiff");
    await run("say", ["-v", process.env.SAY_VOICE || "Samantha", "-r", process.env.SAY_RATE || "185", "-o", aiff, "--", speak]);
    await toWav(aiff, file);
    fs.rmSync(aiff);
    const dur = await duration(file);
    result = { dur, words: estimate(words, dur) };
  } else {
    throw new Error(`Unknown VOICE=${VOICE}; use say, recorded or elevenlabs`);
  }
  fs.writeFileSync(meta, JSON.stringify(result));
  return { file, ...result };
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

const beats = script.beats;
console.log(`${name}: voice (${VOICE})`);
const voices = [];
for (let i = 0; i < beats.length; i++) voices.push(await voiceFor(beats[i], i, beats));

// Speeding up: SPEED sets it, FIT works it out from the time everything
// but the voice takes (pauses, lead-in and the end)
{
  const fixed = LEAD + TAIL + beats.slice(0, -1).reduce((n, b) => n + (b.pause ?? GAP), 0);
  const spoken = voices.reduce((n, v) => n + v.dur, 0);
  const speed = process.env.SPEED
    ? Number(process.env.SPEED)
    : process.env.FIT
      ? Math.min(1.25, Math.max(1, spoken / (Number(process.env.FIT) - fixed)))
      : 1;
  if (!(speed >= 0.5 && speed <= 2)) throw new Error("SPEED is a number from 0.5 to 2");
  if (speed !== 1) {
    console.log(`  voice at ${speed.toFixed(2)}x`);
    for (const v of voices) {
      const fast = v.file.replace(/\.wav$/, `-x${speed.toFixed(3)}.wav`);
      await run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", "-i", v.file, "-af", `atempo=${speed}`, fast]);
      v.file = fast;
      v.dur /= speed;
      v.words = v.words.map((w) => ({ ...w, start: w.start / speed, end: w.end / speed }));
    }
  }
}

let clock = LEAD;
const timeline = beats.map((b, i) => {
  const v = voices[i];
  const start = clock;
  clock += v.dur + (b.pause ?? GAP);
  return { start, end: start + v.dur, words: v.words.map((w) => ({ ...w, start: w.start + start, end: w.end + start })) };
});
const END = timeline.at(-1).end + TAIL;
// Pictures change a moment before each line starts
timeline.forEach((t, i) => {
  t.vstart = i === 0 ? 0 : t.start - 0.15;
});
timeline.forEach((t, i) => {
  t.vend = timeline[i + 1]?.vstart ?? END;
});

// Captions: two or three words at a time, breaking after punctuation
const chunks = [];
timeline.forEach((t, i) => {
  if (beats[i].outro) return;
  let cur = [];
  const flush = () => cur.length && chunks.push(cur) && (cur = []);
  for (const w of t.words) {
    cur.push(w);
    const chars = cur.reduce((n, x) => n + x.w.length + 1, 0);
    if (cur.length >= 3 || chars >= 17 || /[.,!?:;—–]["”’)]*$/.test(w.w)) flush();
  }
  flush();
  // The last caption of a line stays up through the pause after it
  chunks.at(-1).until = t.end + 0.2;
});
const captions = chunks.map((c, k) => ({
  start: c[0].start - 0.05,
  end: c.until ?? Math.min(chunks[k + 1][0].start - 0.05, c.at(-1).end + 0.6),
  words: c.map((w) => ({ w: w.w, start: w.start })),
}));

const secs = END.toFixed(1);
console.log(`  ${secs}s${END > 32 ? " (aim for 30s or less; trim the script)" : ""}`);

// ---------------------------------------------------------------------------
// Audio mix
// ---------------------------------------------------------------------------

const mix = path.join(OUT, "audio", "mix.wav");
{
  const n = voices.length;
  const inputs = voices.flatMap((v) => ["-i", v.file]);
  const delays = timeline.map((t, i) => `[${i}]adelay=${Math.round(t.start * 1000)}:all=1[a${i}]`).join(";");
  let graph = `${delays};${timeline.map((_, i) => `[a${i}]`).join("")}amix=inputs=${n}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,apad,atrim=0:${secs}[voice]`;
  if (MUSIC) {
    // From the track's start; it eases to half volume as the end card comes
    // in, so the sign-off has room, then fades out over the last moments
    const outroAt = timeline[beats.findIndex((b) => b.outro)]?.vstart ?? END - 4;
    const ease = `volume='if(lt(t,${outroAt.toFixed(2)}),1,max(0.5,1-0.5*(t-${outroAt.toFixed(2)})/1.5))':eval=frame`;
    inputs.push("-stream_loop", "-1", "-i", MUSIC);
    graph += `;[${n}]loudnorm=I=${process.env.MUSIC_LEVEL || -24}:TP=-3,atrim=0:${secs},asetpts=PTS-STARTPTS,${ease},afade=t=in:d=0.3,afade=t=out:st=${(END - 1.5).toFixed(2)}:d=1.5[bed];[voice][bed]amix=inputs=2:normalize=0[out]`;
  }
  await run(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error", ...inputs, "-filter_complex", graph, "-map", MUSIC ? "[out]" : "[voice]", "-ar", "48000", mix]);
}

// ---------------------------------------------------------------------------
// The page
// ---------------------------------------------------------------------------

const FONTS =
  "https://fonts.googleapis.com/css2?family=DM+Mono:wght@500&family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Inter:wght@500;600;700;800;900&display=block";
const PARTY = { R: "#d6413b", D: "#2f6fdb", I: "#7a55c7" };

const CSS = `
:root { --paper: #f4f1eb; --blue: #008cff; --ink: #000; --gray: #535353; --muted: #7b7c81; --line: #d9d4ca; }
* { box-sizing: border-box; margin: 0; padding: 0; }
body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; color: #fff;
  font-family: Inter, -apple-system, "Segoe UI", sans-serif; }
.bg { position: absolute; inset: 0; overflow: hidden; opacity: 0; }
.bg img { width: 100%; height: 100%; object-fit: cover; display: block; }
.shade { position: absolute; inset: 0; background: linear-gradient(180deg,
  rgba(0,0,0,.78) 0%, rgba(0,0,0,.45) 28%, rgba(0,0,0,.30) 48%, rgba(0,0,0,.55) 64%, rgba(0,0,0,.88) 100%); }
.top { position: absolute; left: 70px; right: 70px; top: 196px; display: flex; align-items: center; gap: 18px; }
${WORDMARK_CSS}
.series { margin-left: 8px; padding-left: 22px; border-left: 2px solid rgba(255,255,255,.4);
  font: 500 28px "DM Mono", monospace; text-transform: uppercase; letter-spacing: .04em; color: rgba(255,255,255,.85); }
.beat { position: absolute; left: 70px; right: 120px; top: 330px; display: flex; flex-direction: column; align-items: flex-start; }
.head { font-family: Fraunces, serif; font-weight: 900; font-size: 104px; line-height: 1.02; letter-spacing: -0.02em;
  text-shadow: 0 4px 34px rgba(0,0,0,.45); }
.head mark { background: var(--blue); color: #fff; padding: 0 .1em; border-radius: .08em;
  -webkit-box-decoration-break: clone; box-decoration-break: clone; text-shadow: none; }
.sub { margin-top: 26px; font: 500 34px "DM Mono", monospace; text-transform: uppercase; letter-spacing: .03em; color: rgba(255,255,255,.88); }
.card { margin-top: 58px; background: var(--paper); color: var(--ink); border-radius: 30px; padding: 38px 42px;
  box-shadow: 0 18px 60px rgba(0,0,0,.4); }
.card .kick { font: 500 28px "DM Mono", monospace; text-transform: uppercase; color: var(--blue); letter-spacing: .02em; }
.member { display: flex; align-items: center; gap: 34px; padding-right: 54px; }
.member img { width: 190px; height: 190px; border-radius: 50%; object-fit: cover; object-position: 50% 18%; border: 7px solid; }
.member .nm { font: 800 54px/1.05 Inter, sans-serif; letter-spacing: -0.01em; }
.member .dt { margin-top: 12px; font: 500 30px "DM Mono", monospace; color: var(--gray); }
.coin { margin-top: 64px; width: 500px; height: 500px; border-radius: 50%; overflow: hidden; align-self: center;
  box-shadow: 0 24px 70px rgba(0,0,0,.55); }
.coin img { width: 112%; height: 112%; margin: -6%; object-fit: cover; display: block; }
.stages { width: 100%; }
.track { display: flex; margin-top: 30px; }
.step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; }
.step::before { content: ""; position: absolute; top: 21px; left: -50%; width: 100%; height: 6px; background: var(--line); z-index: 0; }
.step:first-child::before { display: none; }
.step.done::before, .step.current::before { background: var(--blue); }
.dot { width: 48px; height: 48px; border-radius: 50%; border: 6px solid var(--line); background: var(--paper); z-index: 1;
  display: flex; align-items: center; justify-content: center; color: #fff; font: 800 26px Inter; }
.done .dot { background: var(--blue); border-color: var(--blue); }
.current .dot { border-color: var(--blue); }
.step span { margin-top: 16px; font: 600 26px/1.15 Inter, sans-serif; color: var(--gray); padding: 0 6px; }
.current span, .done span { color: var(--ink); }
.vote { width: 100%; }
.vote .score { margin-top: 10px; font: 900 132px/1 Fraunces, serif; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; }
.vote .score i { font-style: normal; color: var(--muted); padding: 0 .08em; }
.bar { margin-top: 26px; height: 26px; border-radius: 13px; background: #c9c3b8; overflow: hidden; display: flex; }
.bar b { display: block; height: 100%; background: var(--blue); }
.legend { margin-top: 18px; display: flex; justify-content: space-between; font: 600 30px Inter, sans-serif; color: var(--gray); }
.legend b { color: var(--ink); }
.vote .bill { margin-top: 22px; padding-top: 22px; border-top: 2px solid var(--line); font: 600 30px/1.25 Inter, sans-serif; }
.stat { display: flex; align-items: center; gap: 34px; padding-right: 54px; }
.stat .num { font: 900 190px/0.9 Fraunces, serif; color: var(--blue); letter-spacing: -0.03em; }
.stat .lbl { font: 800 50px/1.1 Inter, sans-serif; max-width: 460px; }
.list { width: 100%; padding-top: 30px; padding-bottom: 30px; }
.item { display: flex; gap: 22px; align-items: baseline; padding: 18px 0; border-top: 2px solid var(--line); font: 700 38px/1.2 Inter, sans-serif; }
.item:first-of-type { border-top: 0; }
.item i { font: 500 28px "DM Mono", monospace; font-style: normal; color: var(--blue); }
#cap { position: absolute; left: 60px; right: 140px; top: 1300px; text-align: center;
  font: 900 70px/1.18 Inter, sans-serif; letter-spacing: -0.01em; text-transform: none;
  text-shadow: 0 0 3px #000, 0 3px 18px rgba(0,0,0,.85); }
#cap span { display: inline-block; margin: 0 .12em; border-radius: 12px; }
#cap span.on { background: var(--blue); box-shadow: 0 0 0 10px var(--blue); text-shadow: none; }
#outro { position: absolute; inset: 0; background: var(--paper); color: var(--ink); display: flex; flex-direction: column;
  justify-content: center; padding: 0 70px 260px; transform: translateY(100%); }
#outro > * { opacity: 0; }
#outro img { width: 150px; height: 150px; border-radius: 32px; }
#outro .t { margin-top: 54px; font: 900 128px/1 Fraunces, serif; letter-spacing: -0.02em; }
#outro .s { margin-top: 30px; font: 700 50px/1.2 Inter, sans-serif; color: var(--gray); max-width: 860px; }
#outro .u { margin-top: 56px; align-self: flex-start; font: 500 40px "DM Mono", monospace; color: #fff; background: var(--blue);
  padding: 18px 28px; border-radius: 16px; }
`;

function cardHtml(c) {
  if (!c) return "";
  switch (c.type) {
    case "member":
      return `<div class="card member" data-in><img src="${photoUrl(`members/${c.id}.jpg`)}" style="border-color:${PARTY[c.party] || "#999"}">
        <div><div class="nm">${esc(c.name)}</div><div class="dt">${esc(c.detail)}</div></div></div>`;
    case "coin":
      return `<div class="coin" data-coin><img src="${photoUrl(c.photo)}"></div>`;
    case "stages":
      return `<div class="card stages" data-in><div class="kick">${esc(c.label || "Where it stands")}</div><div class="track">${c.stages
        .map((s) => `<div class="step ${s.status}" data-step><div class="dot">${s.status === "done" ? "✓" : ""}</div><span>${esc(s.label)}</span></div>`)
        .join("")}</div></div>`;
    case "vote": {
      const yea = c.yea / (c.yea + c.nay);
      return `<div class="card vote" data-in><div class="kick">${esc(c.label)}</div>
        <div class="score"><span data-count="${c.yea}">${c.yea}</span><i>–</i><span data-count="${c.nay}">${c.nay}</span></div>
        <div class="bar"><b data-fill style="width:${(yea * 100).toFixed(1)}%"></b></div>
        <div class="legend"><span><b>Yea</b> ${c.yea}</span><span><b>Nay</b> ${c.nay}</span></div>
        ${c.bill ? `<div class="bill">${esc(c.bill)}</div>` : ""}</div>`;
    }
    case "stat":
      return `<div class="card stat" data-in><div class="num" data-count="${c.value}">${c.value}</div><div class="lbl">${esc(c.label)}</div></div>`;
    case "list":
      return `<div class="card list" data-in>${c.items.map((it, k) => `<div class="item" data-step><i>${String(k + 1).padStart(2, "0")}</i><span>${esc(it)}</span></div>`).join("")}</div>`;
    default:
      throw new Error(`Unknown card type ${c.type}`);
  }
}

const outro = beats.find((b) => b.outro);
const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="${FONTS}"><style>${CSS}</style></head><body>
${beats.map((b) => (b.outro ? "<div class=\"bg\"></div>" : `<div class="bg"><img src="${photoUrl(b.photo)}" style="object-position:${b.focus || "50% 50%"}"></div>`)).join("\n")}
<div class="shade"></div>
<div class="top">${wordmark(46)}${script.series ? `<div class="series">${esc(script.series)}</div>` : ""}</div>
${beats.map((b) => (b.outro ? `<div class="beat"></div>` : `<div class="beat"><div class="head">${rich(b.head)}</div>${b.sub ? `<div class="sub">${esc(b.sub)}</div>` : ""}${cardHtml(b.card)}</div>`)).join("\n")}
<div id="cap"></div>
${outro ? `<div id="outro"><img src="${LOGO}"><div class="t">${rich(outro.head || "Congress Weekly")}</div><div class="s">${esc(outro.sub || "")}</div><div class="u">${esc(outro.url || "unuminitiative.com/newsletter")}</div></div>` : ""}
<script>
const EASE = "cubic-bezier(.2,.8,.2,1)";
window.anims = []; window.ticks = [];
const anim = (el, frames, at, dur, { easing = EASE, fill = "both" } = {}) =>
  anims.push(el.animate(frames, { delay: at * 1000, duration: dur * 1000, easing, fill }));
window.seek = (t) => {
  for (const a of anims) { a.pause(); a.currentTime = t * 1000; }
  for (const f of ticks) f(t);
};
const T = ${JSON.stringify({ timeline: timeline.map(({ vstart, vend }) => ({ vstart, vend })), outro: beats.map((b) => !!b.outro), captions })};
const rise = (el, at, d = 34, dur = 0.5) => anim(el, { opacity: [0, 1], translate: ["0 " + d + "px", "0 0"] }, at, dur);
const bgs = [...document.querySelectorAll(".bg")], els = [...document.querySelectorAll(".beat")];
T.timeline.forEach(({ vstart, vend }, i) => {
  const bg = bgs[i], el = els[i], first = i === 0;
  if (T.outro[i]) {
    const o = document.getElementById("outro");
    anim(o, { transform: ["translateY(100%)", "translateY(0)"] }, vstart, 0.5);
    [...o.children].forEach((c, k) => rise(c, vstart + 0.3 + k * 0.12, 30));
    return;
  }
  // Background: fades in over the last one, with a slow push in or out
  if (first) bg.style.opacity = 1; else anim(bg, { opacity: [0, 1] }, vstart, 0.35, { easing: "linear" });
  const zoom = i % 2 ? ["scale(1.16)", "scale(1.03)"] : ["scale(1.03)", "scale(1.16)"];
  anim(bg.firstElementChild, { transform: zoom }, vstart, vend - vstart + 0.4, { easing: "linear" });
  // Headline, then the card. The first headline is up from frame one, so it
  // also works as the cover
  const head = el.querySelector(".head"), sub = el.querySelector(".sub");
  const rest = [...el.children].filter((c) => c !== head && c !== sub);
  if (first) for (const t of [head, sub].filter(Boolean)) anim(t, { transform: ["scale(1.04)", "scale(1)"], transformOrigin: ["0 0", "0 0"] }, 0, 1.2);
  else [head, sub].filter(Boolean).forEach((t, k) => rise(t, vstart + k * 0.12, 40));
  rest.forEach((c, k) => {
    const at = (first ? 0.5 : vstart) + 0.2 + k * 0.15;
    if (c.matches("[data-coin]")) anim(c, { opacity: [0, 1], transform: ["perspective(1200px) rotateY(85deg) scale(.7)", "perspective(1200px) rotateY(0) scale(1)"] }, at, 0.9);
    else rise(c, at, 30);
    c.querySelectorAll("[data-step]").forEach((s, j) => rise(s, at + 0.15 + j * 0.14, 16, 0.4));
    c.querySelectorAll("[data-fill]").forEach((b) => { b.style.transformOrigin = "0 50%"; anim(b, { transform: ["scaleX(0)", "scaleX(1)"] }, at + 0.25, 0.9); });
    c.querySelectorAll(".current .dot").forEach((d) => ticks.push((now) => {
      const p = Math.max(0, now - at - 0.6);
      d.style.boxShadow = p ? "0 0 0 " + (4 + 9 * Math.abs(Math.sin(p * 3))).toFixed(1) + "px rgba(0,140,255,.28)" : "none";
    }));
    c.querySelectorAll("[data-count]").forEach((n) => {
      const target = Number(n.dataset.count);
      ticks.push((now) => {
        const p = Math.min(1, Math.max(0, (now - at - 0.15) / 0.9));
        n.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US");
      });
    });
  });
  if (vend < ${END}) anim(el, { opacity: [1, 0] }, vend - 0.2, 0.2, { fill: "forwards" });
});
// Captions: the current word lights up
const cap = document.getElementById("cap");
let shown = -1;
ticks.push((now) => {
  const k = T.captions.findIndex((c) => now >= c.start && now < c.end);
  if (k !== shown) {
    shown = k;
    cap.innerHTML = "";
    if (k >= 0) for (const w of T.captions[k].words) { const s = document.createElement("span"); s.textContent = w.w; cap.appendChild(s); }
  }
  if (k < 0) return;
  const c = T.captions[k];
  let on = 0;
  c.words.forEach((w, j) => { if (now >= w.start) on = j; });
  [...cap.children].forEach((s, j) => s.classList.toggle("on", j === on));
  const p = Math.min(1, (now - c.start) / 0.12);
  cap.style.transform = "scale(" + (0.92 + 0.08 * p).toFixed(3) + ")";
});
window.ready = async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
};
</script></body></html>`;

// ---------------------------------------------------------------------------
// Recording
// ---------------------------------------------------------------------------

const pageFile = path.join(OUT, `${name}.html`);
fs.writeFileSync(pageFile, html);
const outFile = path.join(OUT, `${name}.mp4`);
const browser = await puppeteer.launch({ executablePath: CHROME, args: ["--hide-scrollbars", "--allow-file-access-from-files"] });
try {
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(pageFile).href, { waitUntil: "networkidle0" });
  await page.evaluate(() => window.ready());

  const ffmpeg = spawn(FFMPEG, [
    "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-i", mix,
    "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
    "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", outFile,
  ], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((resolve, reject) => {
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with ${code}`))));
  });
  const frames = Math.ceil(END * FPS);
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => window.seek(t), i / FPS);
    const jpg = await page.screenshot({ type: "jpeg", quality: 92 });
    if (i === 0) fs.writeFileSync(path.join(OUT, "cover.jpg"), jpg);
    if (!ffmpeg.stdin.write(jpg)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
    if (i % (FPS * 5) === 0) process.stdout.write(`  frame ${i}/${frames}\r`);
  }
  ffmpeg.stdin.end();
  await done;
} finally {
  await browser.close();
}

// The post text, with credits for the photos used
const oldCredits = JSON.parse(fs.readFileSync(path.join(PHOTOS, "credits.json"), "utf8"));
const creditFor = (name) => (library[name] ? library[name].credit : oldCredits[name]);
const used = new Set(beats.flatMap((b) => [b.photo, b.card?.photo]).filter(Boolean).map(creditFor).filter(Boolean));
const credits = [used.size ? `Photos: ${[...used].join("; ")}.` : "", MUSIC ? MUSIC_CREDIT : ""].filter(Boolean).join("\n");
fs.writeFileSync(path.join(OUT, "caption.txt"), [script.caption, credits].filter(Boolean).join("\n\n") + "\n");
console.log(`  ${path.relative(process.cwd(), outFile)}`);
