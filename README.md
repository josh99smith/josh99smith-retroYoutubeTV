# 📺 Retro YouTube TV — 90s TV Guide Edition

A black-plastic 1990s television whose home screen is a **Prevue / TV-Guide
Channel** style interface: a live YouTube **video preview** window up top and
an **auto-scrolling program listings grid** below. Tune to a channel to watch
it full-screen, complete with a 90s channel banner.

![retro tv](https://img.shields.io/badge/style-90s%20CRT-blue)

**Live:** <https://josh99smith.github.io/josh99smith-retroYoutubeTV/>

## Features

- 📼 Chunky 90s black-plastic cabinet (FUNTRON "STEREO · COLOR"), speaker grille, power LED
- 🗂️ **TV-Guide channel**: scrolling blue listings grid + live preview window + promo panel + on-screen clock
- 📺 Full-screen "tune in" mode with a retro **channel banner** (CH 07 SYNTHWAVE)
- 📡 **Static / noise burst** when changing channels
- 🔌 CRT "collapse to a dot" power-off animation, scanlines, curved-glass glare
- 🎚️ Working **POWER**, **CH ▲/▼**, **GUIDE**, **WATCH**, and **volume** controls
- ⌨️ Keyboard: `P` = power, ↑/↓ = channel, `G` = guide, `Enter` = watch

## Run it

It's a static site — no build step. Just serve the folder:

```bash
# Python (built in)
python3 -m http.server 8000

# or Node
npx serve .
```

Then open <http://localhost:8000>.

> YouTube's IFrame player requires being served over `http://` (or `https://`),
> so use a local server rather than opening `index.html` directly with `file://`.

## Customize channels

Channels are just YouTube video IDs. Edit the `CHANNELS` array at the top of
[`app.js`](app.js):

```js
const CHANNELS = [
  { num: 2, name: "LO-FI 24", id: "jfKfPfyJRdk",
    shows: ["Late Night Beats", "Study Hall", "Midnight Loops"] },
  // add your own { num, name, id, shows: [s1, s2, s3] } ...
];
```

`id` is the part after `watch?v=` in a YouTube URL. `shows` are the three
program names shown across the guide's time columns.

## Tech

Plain HTML, CSS, and vanilla JavaScript using the
[YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference).
No frameworks, no dependencies.
