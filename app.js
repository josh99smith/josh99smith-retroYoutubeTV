/* Retro YouTube TV — 90s TV Guide edition
 *
 * A black-plastic 90s television with a Prevue/TV-Guide home screen, a 90s
 * green on-screen display (channel + volume bar), static distortion between
 * channel changes, and a big lineup of popular YouTube videos.
 *
 * UX: tap any show in the guide to watch it, tap-to-unmute, channel "bug" +
 * back-to-guide chip while watching, and direct channel-number entry.
 *
 * NOTE: live "trending" needs the YouTube Data API (a private key), so this
 * zero-dependency static site uses a curated set of top / most-viewed videos.
 */

/* Lineup favors content that embeds reliably: 24/7 live radio streams and
 * Creative-Commons films play almost everywhere. A few popular music videos
 * are included too; if any refuses to embed you'll see the NO SIGNAL card. */
const CHANNELS = [
  { num: 2,  name: "LO-FI 24",   id: "jfKfPfyJRdk", shows: ["Beats to Relax", "Study Hall", "Midnight Loops"] },
  { num: 3,  name: "SYNTHWAVE",  id: "4xDzrJKXOOY", shows: ["Neon Drive", "Outrun '89", "Midnight Run"] },
  { num: 4,  name: "CHILL FM",   id: "rUxyKA_-grg", shows: ["Lounge Hour", "Easy Listening", "After Dark"] },
  { num: 5,  name: "JAZZ NITE",  id: "Dx5qFachd3A", shows: ["Smooth Sets", "Blue Note Hour", "Late Lounge"] },
  { num: 6,  name: "CARTOON",    id: "aqz-KE-bpKQ", shows: ["Big Buck Bunny", "Matinee", "All Ages"] },
  { num: 7,  name: "NATURE HD",  id: "BHACKCNDMW8", shows: ["Wild Coastlines", "Aerial Earth", "Rainforest"] },
  { num: 8,  name: "COFFEE TV",  id: "1fueZCTYkpA", shows: ["Morning Brew", "Bossa Cafe", "Slow Mornings"] },
  { num: 9,  name: "GANGNAM TV", id: "9bZkp7q19f0", shows: ["PSY — Gangnam Style", "K-Pop Hour", "Viral Classics"] },
  { num: 10, name: "DESPACITO",  id: "kJQP7kiw5Fk", shows: ["Luis Fonsi — Despacito", "Latin Hits", "Top Charts"] },
  { num: 11, name: "FUNK FM",    id: "OPf0YbXqDm0", shows: ["Uptown Funk", "Feel-Good Hits", "Dance Party"] },
  { num: 12, name: "KATY PERRY", id: "CevxZvSJLk8", shows: ["Roar", "Pop Anthems", "Top 40"] },
  { num: 13, name: "DRAGONS TV", id: "7wtfhZwyrcc", shows: ["Believer", "Rock Hour", "Top 40"] },
  { num: 14, name: "WALKER FM",  id: "60ItHLz5WEA", shows: ["Faded", "EDM Hour", "Dance Party"] },
  { num: 15, name: "KIDS ZONE",  id: "XqZsoesa55w", shows: ["Baby Shark", "Cartoon Hits", "All Ages"] },
];

const SEGMENTS = 15;
const VOL_STEP = 10;
const DEFAULT_VOL = 60;

let player;
let playerReady = false;
let index = 0;
let isOn = false;
let tuned = false;
let volume = 0;        // starts muted so the video can autoplay on mobile

const $ = (id) => document.getElementById(id);
const els = {
  screen: $("screen"), guide: $("guide"),
  promoNow: $("promoNow"), promoClock: $("promoClock"), previewTag: $("previewTag"),
  previewWindow: $("previewWindow"),
  listingsRows: $("listingsRows"), listingsViewport: $("listingsViewport"),
  noSignal: $("noSignal"), nsText: $("nsText"),
  chanBug: $("chanBug"), bugNum: $("bugNum"), bugName: $("bugName"), guideChip: $("guideChip"),
  osdCh: $("osdCh"), osdChNum: $("osdChNum"), osdChName: $("osdChName"),
  osdVol: $("osdVol"), osdSpk: $("osdSpk"), volBar: $("volBar"), unmuteBtn: $("unmuteBtn"),
  static: $("static"), powerOff: $("powerOff"), led: $("led"), hint: $("hint"),
  powerBtn: $("powerBtn"), chUp: $("chUp"), chDown: $("chDown"),
  volUp: $("volUp"), volDown: $("volDown"), guideBtn: $("guideBtn"), watchBtn: $("watchBtn"),
  fullBtn: $("fullBtn"),
  slot0: $("slot0"), slot1: $("slot1"), slot2: $("slot2"),
};

const wrap = (i) => (i % CHANNELS.length + CHANNELS.length) % CHANNELS.length;

/* ---------- YouTube ---------- */
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    // privacy domain + explicit origin avoids YouTube's "confirm you're not a
    // bot" interstitial that appears on plain cross-origin embeds
    host: "https://www.youtube-nocookie.com",
    videoId: CHANNELS[index].id,
    playerVars: { autoplay: 0, controls: 0, rel: 0, iv_load_policy: 3, playsinline: 1, mute: 1, origin: location.origin },
    events: {
      onReady: () => {
        playerReady = true;
        player.mute();
        if (isOn) playCurrent(); // start playing if powered on before the API loaded
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) { setStatic(false); hideNoSignal(); }
      },
      onError: () => showNoSignal("NO SIGNAL", "CHANNEL UNAVAILABLE"),
    },
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

/* ---------- Helpers ---------- */
const pad = (n) => String(n).padStart(2, "0");

function slotLabels() {
  const now = new Date();
  let h = now.getHours();
  let m = now.getMinutes() < 30 ? 0 : 30;
  const out = [];
  for (let i = 0; i < 3; i++) {
    let hh = h % 12; if (hh === 0) hh = 12;
    out.push(`${hh}:${m === 0 ? "00" : "30"} ${h < 12 ? "AM" : "PM"}`);
    m += 30; if (m >= 60) { m = 0; h = (h + 1) % 24; }
  }
  return out;
}

const setStatic = (on) => els.static.classList.toggle("on", on);
const showNoSignal = (t, sub) => { els.nsText.innerHTML = `${t}<span>${sub}</span>`; els.noSignal.classList.add("show"); setStatic(false); };
const hideNoSignal = () => els.noSignal.classList.remove("show");

function updateClock() {
  const now = new Date();
  let h = now.getHours(); const ap = h < 12 ? "AM" : "PM";
  h = h % 12; if (h === 0) h = 12;
  els.promoClock.textContent = `${h}:${pad(now.getMinutes())} ${ap}`;
}

function buildVolBar() {
  els.volBar.innerHTML = "";
  for (let i = 0; i < SEGMENTS; i++) {
    const s = document.createElement("div");
    s.className = "seg";
    els.volBar.appendChild(s);
  }
}
function renderVolBar() {
  const filled = Math.round((volume / 100) * SEGMENTS);
  els.volBar.querySelectorAll(".seg").forEach((s, i) => s.classList.toggle("on", i < filled));
  els.osdSpk.innerHTML = volume === 0 ? "&#128263;" : "&#9834;";
}

function renderListings() {
  const labels = slotLabels();
  els.slot0.textContent = labels[0];
  els.slot1.textContent = labels[1];
  els.slot2.textContent = labels[2];
  const rowHTML = (ch, i) => `
    <div class="row${i === index ? " current" : ""}" data-i="${i}" role="button" tabindex="0"
         aria-label="Watch channel ${ch.num} ${ch.name}">
      <div class="cell cell-ch"><b>${ch.num}</b>${ch.name}</div>
      <div class="cell">${ch.shows[0]}</div>
      <div class="cell">${ch.shows[1]}</div>
      <div class="cell">${ch.shows[2]}</div>
    </div>`;
  const once = CHANNELS.map(rowHTML).join("");
  els.listingsRows.innerHTML = once + once; // duplicate for seamless loop
}

function updatePromo() {
  const ch = CHANNELS[index];
  els.promoNow.textContent = `NOW: CH ${ch.num} ${ch.name} — ${ch.shows[0]}`;
  els.previewTag.textContent = `CH ${ch.num} ${ch.name}`;
  els.bugNum.textContent = pad(ch.num);
  els.bugName.textContent = ch.name;
  document.querySelectorAll(".row").forEach((r) => r.classList.toggle("current", Number(r.dataset.i) === index));
}

/* ---------- 90s OSD ---------- */
function showChannelOSD() {
  const ch = CHANNELS[index];
  els.osdChNum.textContent = pad(ch.num);
  els.osdChName.textContent = ch.name;
  els.osdCh.classList.add("show");
  clearTimeout(showChannelOSD._t);
  showChannelOSD._t = setTimeout(() => els.osdCh.classList.remove("show"), 2600);
}
function showVolumeOSD() {
  renderVolBar();
  els.osdVol.classList.add("show");
  clearTimeout(showVolumeOSD._t);
  showVolumeOSD._t = setTimeout(() => els.osdVol.classList.remove("show"), 1800);
}

/* ---------- Static / glitch ---------- */
function glitch() {
  setStatic(true);
  els.screen.classList.add("glitching");
  clearTimeout(glitch._t);
  glitch._t = setTimeout(() => { setStatic(false); els.screen.classList.remove("glitching"); }, 460);
}

/* ---------- Playback ---------- */
function playCurrent() {
  hideNoSignal();
  glitch();
  if (!playerReady) return;
  setTimeout(() => { player.loadVideoById(CHANNELS[index].id); player.playVideo(); }, 220);
}

/* ---------- Modes ---------- */
function showGuide() {
  tuned = false;
  els.screen.classList.remove("tuned");
  updatePromo();
}
function watchChannel() {
  tuned = true;
  els.screen.classList.add("tuned");
  showChannelOSD();
}
/* surf channels, keeping current view (guide vs. watching) */
function changeChannel(delta) {
  if (!isOn) return;
  index = wrap(index + delta);
  updatePromo();
  showChannelOSD();
  playCurrent();
}
/* jump to a specific channel index and watch it full-screen */
function tuneTo(i) {
  if (!isOn) return;
  index = wrap(i);
  updatePromo();
  playCurrent();
  watchChannel();
}

/* ---------- Volume ---------- */
function setVolume(v) {
  volume = Math.max(0, Math.min(100, v));
  if (playerReady) {
    player.setVolume(volume);
    if (volume === 0) player.mute(); else player.unMute();
  }
  els.screen.classList.toggle("show-unmute", isOn && volume === 0);
  showVolumeOSD();
}
const changeVolume = (d) => { if (isOn) setVolume(volume + d); };

/* ---------- Channel-number entry ---------- */
let entry = "";
function pushDigit(d) {
  if (!isOn) return;
  entry += d;
  els.osdChNum.textContent = entry.padStart(2, "0");
  els.osdChName.textContent = "ENTER…";
  els.osdCh.classList.add("show");
  clearTimeout(pushDigit._t);
  pushDigit._t = setTimeout(resolveEntry, 1300);
}
function resolveEntry() {
  const num = Number(entry); entry = "";
  const i = CHANNELS.findIndex((c) => c.num === num);
  if (i >= 0) tuneTo(i);
  else { els.osdChName.textContent = "NO CHANNEL"; setTimeout(() => els.osdCh.classList.remove("show"), 900); }
}

/* ---------- Power ---------- */
function powerOn() {
  isOn = true;
  els.led.classList.add("on");
  els.powerOff.classList.add("hidden");
  els.screen.classList.remove("off", "turning-off");
  els.hint.innerHTML = "Tap a show to watch &middot; <b>VOL</b> for sound &middot; <b>GUIDE</b> to return";
  showGuide();
  showChannelOSD();
  els.screen.classList.toggle("show-unmute", volume === 0);
  playCurrent();
}
function powerOff() {
  isOn = false; tuned = false;
  els.led.classList.remove("on");
  if (playerReady) player.pauseVideo();
  setStatic(false);
  els.osdCh.classList.remove("show");
  els.osdVol.classList.remove("show");
  els.screen.classList.remove("show-unmute");
  hideNoSignal();
  els.screen.classList.add("turning-off");
  setTimeout(() => {
    els.screen.classList.add("off");
    els.screen.classList.remove("turning-off", "tuned");
    els.powerOff.classList.remove("hidden");
  }, 450);
  els.hint.innerHTML = "Press <b>POWER</b> to turn on the TV";
}
const togglePower = () => (isOn ? powerOff() : powerOn());

/* ---------- Full-screen / cinema mode ---------- */
function isCinema() { return document.body.classList.contains("cinema"); }
function setCinema(on) {
  document.body.classList.toggle("cinema", on);
  els.fullBtn.innerHTML = on ? "&#10005;&nbsp;EXIT" : "&#9974;&nbsp;FULL SCREEN";
  els.fullBtn.setAttribute("aria-label", on ? "Exit full screen" : "Full screen");
  try {
    if (on) {
      const el = document.documentElement;
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else if (document.fullscreenElement || document.webkitFullscreenElement) {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    }
  } catch (_) { /* Fullscreen API unsupported (e.g. iOS) — CSS cinema mode still applies */ }
}
const toggleCinema = () => setCinema(!isCinema());
// keep CSS state in sync if the user leaves native fullscreen via the OS/Esc
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && isCinema()) setCinema(false);
});

/* ---------- Guide scroll: pause while the user is interacting ---------- */
function pauseScroll() {
  els.listingsRows.classList.add("paused");
  clearTimeout(pauseScroll._t);
  pauseScroll._t = setTimeout(() => els.listingsRows.classList.remove("paused"), 2600);
}

/* ---------- Events ---------- */
els.powerBtn.addEventListener("click", togglePower);
els.chUp.addEventListener("click", () => changeChannel(1));
els.chDown.addEventListener("click", () => changeChannel(-1));
els.volUp.addEventListener("click", () => changeVolume(VOL_STEP));
els.volDown.addEventListener("click", () => changeVolume(-VOL_STEP));
els.guideBtn.addEventListener("click", () => { if (isOn) showGuide(); });
els.watchBtn.addEventListener("click", () => { if (isOn) watchChannel(); });
els.guideChip.addEventListener("click", () => { if (isOn) showGuide(); });
els.fullBtn.addEventListener("click", toggleCinema);
els.unmuteBtn.addEventListener("click", () => setVolume(DEFAULT_VOL));
els.previewWindow.addEventListener("click", () => { if (isOn) tuneTo(index); });

// tap a show in the guide to watch it
els.listingsViewport.addEventListener("pointerdown", pauseScroll);
els.listingsRows.addEventListener("click", (e) => {
  const row = e.target.closest(".row");
  if (row) tuneTo(Number(row.dataset.i));
});
els.listingsRows.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const row = e.target.closest(".row");
  if (row) { e.preventDefault(); tuneTo(Number(row.dataset.i)); }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") return togglePower();
  if (e.key === "f" || e.key === "F") return toggleCinema();
  if (e.key === "Escape" && isCinema()) return setCinema(false);
  if (!isOn) return;
  if (e.key >= "0" && e.key <= "9") return pushDigit(e.key);
  switch (e.key) {
    case "ArrowUp":    e.preventDefault(); changeChannel(1); break;
    case "ArrowDown":  e.preventDefault(); changeChannel(-1); break;
    case "ArrowRight": case "+": case "=": changeVolume(VOL_STEP); break;
    case "ArrowLeft":  case "-": changeVolume(-VOL_STEP); break;
    case "m": case "M": setVolume(volume === 0 ? DEFAULT_VOL : 0); break;
    case "g": case "G": showGuide(); break;
    case "Enter":      watchChannel(); break;
  }
});

/* ---------- Init ---------- */
buildVolBar();
renderListings();
renderVolBar();
updateClock();
updatePromo();
setInterval(updateClock, 1000 * 15);
els.screen.classList.add("off");
