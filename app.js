/* Retro YouTube TV — 90s TV Guide edition
 *
 * A black-plastic 90s television whose default screen is a Prevue/TV-Guide
 * style channel: a live video PREVIEW window up top and an auto-scrolling
 * program LISTINGS grid below. Tune to a channel with WATCH to go full screen.
 *
 * Channels are YouTube video IDs plus 3 "program" names for the grid.
 */

const CHANNELS = [
  { num: 2,  name: "LO-FI 24",     id: "jfKfPfyJRdk", shows: ["Late Night Beats", "Study Hall", "Midnight Loops"] },
  { num: 4,  name: "NATURE HD",    id: "BHACKCNDMW8", shows: ["Wild Coastlines", "Rainforest Live", "Aerial Earth"] },
  { num: 5,  name: "CHILL FM",     id: "5qap5aO4i9A", shows: ["Coffee House", "Easy Listening", "After Hours"] },
  { num: 7,  name: "SYNTHWAVE",    id: "4xDzrJKXOOY", shows: ["Neon Drive", "Midnight Run", "Outrun '89"] },
  { num: 9,  name: "JAZZ NITE",    id: "Dx5qFachd3A", shows: ["Smooth Sets", "Blue Note Hour", "Late Lounge"] },
  { num: 11, name: "COSMOS",       id: "21X5lGlDOfg", shows: ["Live From Orbit", "Blue Marble", "Deep Space"] },
  { num: 13, name: "PIANO PM",     id: "4oStw0r33so", shows: ["Evening Keys", "Soft Classics", "Nocturnes"] },
];

let player;
let playerReady = false;
let index = 0;        // currently highlighted / tuned channel
let isOn = false;
let tuned = false;    // false = guide view, true = watching full screen

const $ = (id) => document.getElementById(id);
const els = {
  screen: $("screen"), guide: $("guide"), player: $("player"),
  promoNow: $("promoNow"), promoClock: $("promoClock"), previewTag: $("previewTag"),
  listingsRows: $("listingsRows"),
  banner: $("banner"), bannerNum: $("bannerNum"), bannerName: $("bannerName"),
  static: $("static"), powerOff: $("powerOff"), led: $("led"), hint: $("hint"),
  powerBtn: $("powerBtn"), chUp: $("chUp"), chDown: $("chDown"),
  guideBtn: $("guideBtn"), watchBtn: $("watchBtn"), volume: $("volume"),
  slot0: $("slot0"), slot1: $("slot1"), slot2: $("slot2"),
};

/* ---------- YouTube ---------- */
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    videoId: CHANNELS[index].id,
    playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, iv_load_policy: 3, playsinline: 1, mute: 1 },
    events: {
      onReady: () => {
        playerReady = true;
        player.setVolume(Number(els.volume.value));
      },
      onStateChange: (e) => { if (e.data === YT.PlayerState.PLAYING) setStatic(false); },
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
  // duplicate the list so the vertical scroll loops seamlessly
  const once = CHANNELS.map(rowHTML).join("");
  els.listingsRows.innerHTML = once + once;
}

function updatePromo() {
  const ch = CHANNELS[index];
  els.promoNow.textContent = `NOW: CH ${ch.num} ${ch.name} — ${ch.shows[0]}`;
  els.previewTag.textContent = `CH ${ch.num} ${ch.name}`;
  // re-highlight current row without rebuilding scroll position feel
  document.querySelectorAll(".row").forEach((r) => {
    r.classList.toggle("current", Number(r.dataset.i) === index);
  });
}

function playCurrent() {
  if (!playerReady) return;
  setStatic(true);
  player.loadVideoById(CHANNELS[index].id);
  player.playVideo();
  setTimeout(() => setStatic(false), 1400);
}

function showBanner() {
  const ch = CHANNELS[index];
  els.bannerNum.textContent = pad(ch.num);
  els.bannerName.textContent = ch.name;
  els.banner.classList.add("show");
  clearTimeout(showBanner._t);
  showBanner._t = setTimeout(() => els.banner.classList.remove("show"), 3000);
}

/* ---------- Modes ---------- */
function showGuide() {
  tuned = false;
  els.screen.classList.remove("tuned");
  els.banner.classList.remove("show");
  if (playerReady) player.setVolume(Number(els.volume.value));
  updatePromo();
}

function watchChannel() {
  tuned = true;
  els.screen.classList.add("tuned");
  showBanner();
}

function changeChannel(delta) {
  if (!isOn) return;
  index = (index + delta + CHANNELS.length) % CHANNELS.length;
  updatePromo();
  playCurrent();
  if (tuned) showBanner();
}

/* ---------- Power ---------- */
function powerOn() {
  isOn = true;
  els.led.classList.add("on");
  els.powerOff.classList.add("hidden");
  els.screen.classList.remove("off", "turning-off");
  els.hint.innerHTML = "Browse with <b>CH</b> &middot; <b>WATCH</b> to tune in &middot; <b>GUIDE</b> to return";
  showGuide();
  playCurrent();
}

function powerOff() {
  isOn = false; tuned = false;
  els.led.classList.remove("on");
  if (playerReady) player.pauseVideo();
  setStatic(false);
  els.screen.classList.add("turning-off");
  els.banner.classList.remove("show");
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
els.guideBtn.addEventListener("click", () => { if (isOn) showGuide(); });
els.watchBtn.addEventListener("click", () => { if (isOn) watchChannel(); });
els.volume.addEventListener("input", () => {
  if (!playerReady) return;
  player.setVolume(Number(els.volume.value));
  if (Number(els.volume.value) > 0) player.unMute();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") return togglePower();
  if (!isOn) return;
  if (e.key === "ArrowUp")   changeChannel(1);
  if (e.key === "ArrowDown") changeChannel(-1);
  if (e.key === "g" || e.key === "G") showGuide();
  if (e.key === "Enter") watchChannel();
});

/* ---------- Init ---------- */
renderListings();
updateClock();
updatePromo();
setInterval(updateClock, 1000 * 15);
els.screen.classList.add("off");
