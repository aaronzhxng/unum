// Previews of background tracks under a video's voiceover, to pick music by
// ear. Put any .mp3, .m4a or .wav tracks in unum-social-output/music/, then:
//
//   node social/video/music-previews.mjs 2026-11-23-week          # -24 LUFS
//   node social/video/music-previews.mjs 2026-11-23-week -21      # louder
//
// Each preview is 30 seconds of the video's voice (render the video first)
// with one track underneath at that loudness, in music/previews/. The voice
// is at -14 LUFS, so -24 puts the music 10 below it. Use the same number as
// MUSIC_LEVEL when rendering the video.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { OUTPUT_ROOT } from "../prototypes/lib.mjs";

const [name, levelArg] = process.argv.slice(2);
if (!name) throw new Error("Usage: node social/video/music-previews.mjs <script> [level]");
const level = Number(levelArg ?? -24);
const voice = path.join(OUTPUT_ROOT, "video", name, "audio", "mix.wav");
if (!fs.existsSync(voice)) throw new Error(`No voiceover at ${voice}; render the video first`);
const FFMPEG =
  [process.env.FFMPEG_PATH, path.join(OUTPUT_ROOT, "tools", "node_modules", "ffmpeg-static", "ffmpeg")].find(
    (p) => p && fs.existsSync(p),
  ) || "ffmpeg";

const MUSIC = path.join(OUTPUT_ROOT, "music");
const out = path.join(MUSIC, "previews");
fs.mkdirSync(out, { recursive: true });
const tracks = fs.readdirSync(MUSIC).filter((f) => /\.(mp3|m4a|wav)$/i.test(f));
if (!tracks.length) throw new Error(`No tracks in ${MUSIC}`);

for (const track of tracks) {
  const label = track.replace(/\.[^.]+$/, "");
  const r = spawnSync(FFMPEG, [
    "-loglevel", "error", "-y", "-i", voice, "-stream_loop", "-1", "-i", path.join(MUSIC, track),
    "-filter_complex",
    `[1]loudnorm=I=${level}:TP=-3,atrim=0:30,afade=t=in:d=0.5,afade=t=out:st=28.5:d=1.5[bed];[0][bed]amix=inputs=2:normalize=0,atrim=0:30[out]`,
    "-map", "[out]", "-c:a", "aac", "-b:a", "160k", path.join(out, `${label} (${level}).m4a`),
  ]);
  console.log(r.status === 0 ? `  ${label}` : `  ${label}: failed ${r.stderr}`);
}
console.log(`\n${tracks.length} previews at ${level} LUFS in ${out}`);
