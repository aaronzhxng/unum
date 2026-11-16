# Narrated videos

Short vertical videos (1080 × 1920, about 30 seconds) for TikTok, Reels and
Shorts: a still photo of Washington or a member behind each line, with a slow
push-in, bold text, a data card, a voiceover and word-by-word captions.

```bash
node social/video/video.mjs 2026-11-16-common-cents   # one bill in 30 seconds
node social/video/video.mjs 2026-11-16-week           # last week in Congress
```

Each run writes to `unum-social-output/video/<script>/`:

- `<script>.mp4`: the video
- `cover.jpg`: the first frame, for the cover
- `caption.txt`: the post text with photo credits

A render takes 2 to 3 minutes. The voice is saved, so changing only the
visuals and rendering again doesn't re-record it.

## Making one

Copy a script in `scripts/` and edit the beats. Each beat is one or two
spoken sentences:

| Field | What |
|---|---|
| `say` | The voiceover, which is also the captions. Keep the whole script to about 75 to 85 words. |
| `head` | The bold text. `*Stars*` mark the highlighted words. |
| `sub` | Optional small line under it |
| `photo` | Background from `photos/` |
| `focus` | Optional part of the photo to keep, as a CSS position (`"20% 50%"`) |
| `card` | Optional: `member`, `vote`, `stages`, `stat`, `list` or `coin` (see the two scripts) |
| `speak` | Optional spelling for the voice when it says something wrong; the captions still use `say` |
| `outro: true` | The closing Congress Weekly card |

Take every number, date and name from the newsletter issue, and keep the
wording as plain and nonpartisan as the issue's.

## Voices

| `VOICE=` | What |
|---|---|
| `say` (default) | The Mac's built-in voice. Good for checking a script's length and look; too robotic to post. `SAY_VOICE` and `SAY_RATE` change it. |
| `recorded` | Your own voice. Record each beat as its own file in `recordings/<script>/`: `1.m4a`, `2.m4a`, ... (Voice Memos works; m4a, mp3 or wav). Silence at the ends is trimmed. Recordings stay out of git. |
| `elevenlabs` | AI voice with exact word timings. Needs `ELEVENLABS_API_KEY` and `ELEVENLABS_VOICE_ID`. TikTok expects an AI-generated label on these. |

```bash
VOICE=recorded node social/video/video.mjs 2026-11-16-common-cents
```

`MUSIC=path/to/track.mp3` adds a quiet bed under the voice. Use only music
we have rights to, or leave it out and add a sound in the app before posting.

## Setup

Needs Chrome and ffmpeg. The script finds ffmpeg on the PATH, at
`FFMPEG_PATH`, or installed next to the output folder with:

```bash
npm install --prefix ../unum-social-output/tools ffmpeg-static
```

Photos and their rights are listed in `photos/README.md`.
