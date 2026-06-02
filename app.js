/* Retro YouTube TV — 90s TV Guide edition
 *
 * A black-plastic 90s television with a Prevue/TV-Guide home screen, a 90s
 * green on-screen display (channel + volume bar), static distortion between
 * channel changes, and a big lineup of popular YouTube videos.
 *
 * NOTE: live "trending" requires the YouTube Data API (an API key). To keep
 * this a zero-dependency static site, the lineup below is a curated set of
 * top / most-viewed YouTube videos. Swap in your own IDs freely.
 */

const CHANNELS = [
  { num: 2,  name: "LO-FI 24",   id: "jfKfPfyJRdk", shows: ["Late Night Beats", "Study Hall", "Midnight Loops"] },
  { num: 3,  name: "NASA LIVE",  id: "21X5lGlDOfg", shows: ["Live From Orbit", "Blue Marble", "Deep Space"] },
  { num: 4,  name: "NATURE HD",  id: "BHACKCNDMW8", shows: ["Wild Coastlines", "Aerial Earth", "Rainforest"] },
  { num: 5,  name: "GANGNAM TV", id: "9bZkp7q19f0", shows: ["PSY — Gangnam Style", "K-Pop Hour", "Viral Classics"] },
  { num: 6,  name: "DESPACITO",  id: "kJQP7kiw5Fk", shows: ["Luis Fonsi — Despacito", "Latin Hits", "Top Charts"] },
  { num: 7,  name: "ED SHEERAN", id: "JGwWNGJdvx8", shows: ["Shape of You", "Pop Rotation", "Top 40"] },
  { num: 8,  name: "THROWBACK",  id: "RgKAFK5djSk", shows: ["See You Again", "Throwback Jams", "Top 40"] },
  { num: 9,  name: "FUNK FM",    id: "OPf0YbXqDm0", shows: ["Uptown Funk", "Feel-Good Hits", "Dance Party"] },
  { num: 10, name: "MAROON 5",   id: "09R8_2nJtjg", shows: ["Sugar", "Pop Rotation", "Top 40"] },
  { num: 11, name: "KATY PERRY", id: "CevxZvSJLk8", shows: ["Roar", "Pop Anthems", "Top 40"] },
  { num: 12, name: "T-SWIFT",    id: "nfWlot6h_JM", shows: ["Shake It Off", "Pop Rotation", "Top 40"] },
  { num: 13, name: "DRAGONS TV", id: "7wtfhZwyrcc", shows: ["Believer", "Rock Hour", "Top 40"] },
  { num: 14, name: "ADELE",      id: "YQHsXMglC9A", shows: ["Hello", "Soul & Ballads", "Top 40"] },
  { num: 15, name: "BILLIE",     id: "DyDfgMOUjCI", shows: ["Bad Guy", "Alt Pop", "New Hits"] },
  { num: 16, name: "WALKER FM",  id: "60ItHLz5WEA", shows: ["Faded", "EDM Hour", "Dance Party"] },
  { num: 17, name: "KIDS ZONE",  id: "XqZsoesa55w", shows: ["Baby Shark", "Cartoon Hits", "All Ages"] },
  { num: 18, name: "SYNTHWAVE",  id: "4xDzrJKXOOY", shows: ["Neon Drive", "Outrun '89", "Midnight Run"] },
];

const SEGMENTS = 15;   // volume bar segments
const VOL_STEP = 10;   // volume change per press

let player;
let playerReady = false;
let index = 0;
let isOn = false;
let tuned = false;     // false = guide, true = full-screen watching
let volume = 0;        // starts silent (muted) so it can autoplay on mobile

const $ = (id) => document.getElementById(id);
const els = {
  screen: $("screen"), guide: $("guide"),
  promoNow: $("promoNow"), promoClock: $("promoClock"), previewTag: $("previewTag"),
  listingsRows: $("listingsRows"), noSignal: $("noSignal"),
  osdCh: $("osdCh"), osdChNum: $("osdChNum"), osdChName: $("osdChName"),
  osdVol: $("osdVol"), volBar: $("volBar"),
  static: $("static"), powerOff: $("powerOff"), led: $("led"), hint: $("hint"),
  powerBtn: $("powerBtn"), chUp: $("chUp"), chDown: $("chDown"),
  volUp: $("volUp"), volDown: $("volDown"),
  guideBtn: $("guideBtn"), watchBtn: $("watchBtn"),
  slot0: $("slot0"), slot1: $("slot1"), slot2: $("slot2"),
};

/* ---------- YouTube ---------- */
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: CHANNELS[index].id,
    playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, playsinline: 1, mute: 1 },
    events: {
      onReady: () => { playerReady = true; player.mute(); },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) { setStatic(false); els.noSignal.classList.remove("show"); }
      },
      onError: () => { els.noSignal.classList.add("show"); setStatic(false); },
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

function setStatic(on) { els.static.classList.toggle("on", on); }

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
}

function renderListings() {
  const labels = slotLabels();
  els.slot0.textContent = labels[0];
  els.slot1.textContent = labels[1];
  els.slot2.textContent = labels[2];
  const rowHTML = (ch, i) => `
    <div class="row${i === index ? " current" : ""}" data-i="${i}">
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

/* ---------- Static / glitch between channels ---------- */
function glitch() {
  setStatic(true);
  els.screen.classList.add("glitching");
  clearTimeout(glitch._t);
  glitch._t = setTimeout(() => {
    setStatic(false);
    els.screen.classList.remove("glitching");
  }, 460);
}

/* ---------- Playback ---------- */
function playCurrent() {
  els.noSignal.classList.remove("show");
  glitch();
  if (!playerReady) return;
  setTimeout(() => {
    player.loadVideoById(CHANNELS[index].id);
    player.playVideo();
  }, 220);
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

function changeChannel(delta) {
  if (!isOn) return;
  index = (index + delta + CHANNELS.length) % CHANNELS.length;
  updatePromo();
  showChannelOSD();
  playCurrent();
}

/* ---------- Volume ---------- */
function setVolume(v) {
  volume = Math.max(0, Math.min(100, v));
  if (playerReady) {
    player.setVolume(volume);
    if (volume === 0) player.mute(); else player.unMute();
  }
  showVolumeOSD();
}
const changeVolume = (d) => { if (isOn) setVolume(volume + d); };

/* ---------- Power ---------- */
function powerOn() {
  isOn = true;
  els.led.classList.add("on");
  els.powerOff.classList.add("hidden");
  els.screen.classList.remove("off", "turning-off");
  els.hint.innerHTML = "CH to browse &middot; <b>VOL</b> to raise sound &middot; <b>WATCH</b> / <b>GUIDE</b> to switch view";
  showGuide();
  showChannelOSD();
  playCurrent();
}

function powerOff() {
  isOn = false; tuned = false;
  els.led.classList.remove("on");
  if (playerReady) player.pauseVideo();
  setStatic(false);
  els.osdCh.classList.remove("show");
  els.osdVol.classList.remove("show");
  els.noSignal.classList.remove("show");
  els.screen.classList.add("turning-off");
  setTimeout(() => {
    els.screen.classList.add("off");
    els.screen.classList.remove("turning-off", "tuned");
    els.powerOff.classList.remove("hidden");
  }, 450);
  els.hint.innerHTML = "Press <b>POWER</b> to turn on the TV";
}

const togglePower = () => (isOn ? powerOff() : powerOn());

/* ---------- Events ---------- */
els.powerBtn.addEventListener("click", togglePower);
els.chUp.addEventListener("click", () => changeChannel(1));
els.chDown.addEventListener("click", () => changeChannel(-1));
els.volUp.addEventListener("click", () => changeVolume(VOL_STEP));
els.volDown.addEventListener("click", () => changeVolume(-VOL_STEP));
els.guideBtn.addEventListener("click", () => { if (isOn) showGuide(); });
els.watchBtn.addEventListener("click", () => { if (isOn) watchChannel(); });

document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") return togglePower();
  if (!isOn) return;
  switch (e.key) {
    case "ArrowUp":    changeChannel(1); break;
    case "ArrowDown":  changeChannel(-1); break;
    case "ArrowRight": case "+": case "=": changeVolume(VOL_STEP); break;
    case "ArrowLeft":  case "-": changeVolume(-VOL_STEP); break;
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
