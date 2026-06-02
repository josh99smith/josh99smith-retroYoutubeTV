# 📺 Retro YouTube TV

A vintage CRT-television interface for watching YouTube. Wooden cabinet,
scanlines, channel knobs, static transitions, and a satisfying CRT power-off
animation.

![retro tv](https://img.shields.io/badge/style-CRT-orange)

## Features

- 🪵 Wood-grain TV cabinet with speaker grille and angled legs
- 📺 CRT effects: scanlines, screen glare, curved-glass vignette
- 📡 **Static / noise burst** when changing channels
- 🔌 CRT-style "collapse to a dot" power-off animation
- 🎚️ Working **power**, **channel up/down**, and **volume** controls
- ⌨️ Keyboard shortcuts: `P` = power, arrow keys = change channel
- 🟢 On-screen channel display (OSD)

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
  { name: "Lo-Fi Beats", id: "jfKfPfyJRdk" },
  { name: "Nature Relaxation", id: "BHACKCNDMW8" },
  // add your own { name, id } ...
];
```

The `id` is the part after `watch?v=` in a YouTube URL.

## Tech

Plain HTML, CSS, and vanilla JavaScript using the
[YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference).
No frameworks, no dependencies.
