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

/* Each "channel" is a real top YouTube channel. We play the channel's uploads
 * playlist (the UC… channel id maps to a UU… uploads playlist), so a channel
 * shows a rotating feed of its actual videos — latest first.
 *
 * A few channels may have embedding disabled on some videos; those show the
 * NO SIGNAL card and (while watching) auto-surf to the next channel.
 */
const CHANNELS = [
  { num: 2,  name: "MR BEAST",      ch: "UCX6OQ3DkcsbYNE6H8uQQuVA", cat: "ENTERTAINMENT" },
  { num: 3,  name: "LOFI GIRL",     ch: "UCSJ4gkVC6NrvII8umztf0Ow", cat: "MUSIC • LIVE" },
  { num: 4,  name: "DUDE PERFECT",  ch: "UCRijo3ddMTht_IHyNSNXpNQ", cat: "SPORTS" },
  { num: 5,  name: "MARK ROBER",    ch: "UCY1kMZp36IQSyNx_9h4mpCg", cat: "SCIENCE" },
  { num: 6,  name: "KURZGESAGT",    ch: "UCsXVk37bltHxD1rDPwtNM8Q", cat: "SCIENCE" },
  { num: 7,  name: "VERITASIUM",    ch: "UCHnyfMqiRRG1u-2MsSQLbXA", cat: "SCIENCE" },
  { num: 8,  name: "NASA",          ch: "UCLA_DiR1FfKNvjuUpBHmylQ", cat: "SPACE" },
  { num: 9,  name: "NAT GEO",       ch: "UCpVm7bg6pXKo1Pr6k5kxG9A", cat: "NATURE" },
  { num: 10, name: "BBC EARTH",     ch: "UCwmZiChSryoWQCZMIQezgTg", cat: "NATURE" },
  { num: 11, name: "TED",           ch: "UCAuUUnT6oDeKwE6v1NGQxug", cat: "EDUCATION" },
  { num: 12, name: "VOX",           ch: "UCLXo7UDZvByw2ixzpQCufnA", cat: "NEWS" },
  { num: 13, name: "VSAUCE",        ch: "UC6nSFpj9HTCZ5t-N3Rm3-HA", cat: "SCIENCE" },
  { num: 14, name: "KHAN ACADEMY",  ch: "UC4a-Gbdw7vOaccHmFo40b9g", cat: "EDUCATION" },
  { num: 15, name: "MKBHD",         ch: "UCBJycsmduvYEL83R_U4JriQ", cat: "TECH" },
  { num: 16, name: "MRWHOSEBOSS",   ch: "UCMiJRAwDNSNzuYeN2uWa0pA", cat: "TECH" },
  { num: 17, name: "LINUS TECH",    ch: "UCXuqSBlHAE6Xw-yeJA0Tunw", cat: "TECH" },
  { num: 18, name: "APPLE",         ch: "UCE_M8A5yxnLfW0KghEeajjw", cat: "TECH" },
  { num: 19, name: "PEWDIEPIE",     ch: "UC-lHJZR3Gqxm24_Vd_AJ5Yw", cat: "GAMING" },
  { num: 20, name: "SMOSH",         ch: "UCY30JRSgfhYXA6i6xX1erWg", cat: "COMEDY" },
  { num: 21, name: "WWE",           ch: "UCJ5v_MCY6GNUBTO8-D3XoAg", cat: "SPORTS" },
  { num: 22, name: "NBA",           ch: "UCWJ2lWNubArHWmf3FIHbfcQ", cat: "SPORTS" },
  { num: 23, name: "NFL",           ch: "UCDVYQ4Zhbm3S2dlz7P1GBDg", cat: "SPORTS" },
  { num: 24, name: "REAL MADRID",   ch: "UCWV3obpZVGgJ3j9FVhEjF2Q", cat: "SOCCER" },
  { num: 25, name: "COCOMELON",     ch: "UCbCmjCuTUZos6Inko4u57UQ", cat: "KIDS" },
  { num: 26, name: "KIDS DIANA",    ch: "UCk8GzjMOrta8yxDcKfylJYw", cat: "KIDS" },
  { num: 27, name: "LIKE NASTYA",   ch: "UCJplp5SjeGSdVdwsfb9Q7lQ", cat: "KIDS" },
  { num: 28, name: "VLAD & NIKI",   ch: "UCvlE5gTbOvjiolFlEm-c_Ow", cat: "KIDS" },
  { num: 29, name: "RYAN'S WORLD",  ch: "UChGJGhZ9SOOHvBB0Y4DOO_w", cat: "KIDS" },
  { num: 30, name: "5-MIN CRAFTS",  ch: "UC295-Dw_tDNtZXFeAPAW6Aw", cat: "DIY" },
  { num: 31, name: "MR BEAN",       ch: "UClO8gQ5wDx_l9XFC2NK3VOA", cat: "COMEDY" },
  { num: 32, name: "T-SERIES",      ch: "UCq-Fj5jknLsUf-MWSy4_brA", cat: "MUSIC" },
  { num: 33, name: "SET INDIA",     ch: "UCpEhnqL0y41EpW2TvWAHD7Q", cat: "TV" },
  { num: 34, name: "BLACKPINK",     ch: "UCOmHUn--16B90oW2L6FRR3A", cat: "K-POP" },
  { num: 35, name: "BANGTANTV",     ch: "UCLkAepWjdylmXSltofFvsYQ", cat: "K-POP" },
  { num: 36, name: "HYBE LABELS",   ch: "UC3IZKseVpDuPmMya0o4eMCw", cat: "K-POP" },
  { num: 37, name: "ED SHEERAN",    ch: "UC0C-w0YjGpqDXGB8IHb662A", cat: "MUSIC" },
  { num: 38, name: "TAYLOR SWIFT",  ch: "UCqECaJ8Gagnn7YCbPEzWH6g", cat: "MUSIC" },
  { num: 39, name: "ARIANA GRANDE", ch: "UC9CoOnJkIBMdeeDcK7EOWlw", cat: "MUSIC" },
  { num: 40, name: "JUSTIN BIEBER", ch: "UCHkj014U2CQ2Nv0UZeYpE_A", cat: "MUSIC" },
  { num: 41, name: "MARSHMELLO",    ch: "UCEdvpU2pFRCVqU6yIPyTpMQ", cat: "MUSIC" },
  { num: 42, name: "EMINEM",        ch: "UCfM3zsQsOnfWNUppiycmBuw", cat: "MUSIC" },
  { num: 43, name: "COLDPLAY",      ch: "UCDPM_n1atn2ijUwHd0NNRQw", cat: "MUSIC" },
  { num: 44, name: "ZEE MUSIC",     ch: "UCFFbwnve3yF62-tVXkTyHqg", cat: "MUSIC" },
  { num: 45, name: "RIHANNA",       ch: "UCcgqSM4YEo5vVQpqwN-MaNw", cat: "MUSIC" },
  { num: 46, name: "IMAGINE DRGNS", ch: "UCT9zcQNlyht7fRlcjmflRSA", cat: "MUSIC" },
  { num: 47, name: "MAROON 5",      ch: "UCN1hnUccO4FD5WfM7ithXaw", cat: "MUSIC" },
  { num: 48, name: "ONE DIRECTION", ch: "UCbW18JZRgko_mOGm5er8Yzg", cat: "MUSIC" },
  { num: 49, name: "DUA LIPA",      ch: "UC-J-KZfRV8c13fOCkhXdLiQ", cat: "MUSIC" },
  { num: 50, name: "SHAKIRA",       ch: "UCGnjeahCJW1AF34HBmQTJ-Q", cat: "MUSIC" },
  { num: 51, name: "THE WEEKND",    ch: "UC0WP5P-ufpRfjbNrmOWwLBQ", cat: "MUSIC" },
  { num: 52, name: "MAN UNITED",    ch: "UC6yW44UGJJBvYTlfC7CRg2Q", cat: "SOCCER" },
  { num: 53, name: "FC BARCELONA",  ch: "UC14UlmYlSNiQCBe9Eookf_A", cat: "SOCCER" },
  { num: 54, name: "FORMULA 1",     ch: "UCB_qr75-ydFVKSF9Dmo6izg", cat: "SPORTS" },
  { num: 55, name: "ESPN",          ch: "UCiWLfSweyRNmLpgEHekhoAg", cat: "SPORTS" },
  { num: 56, name: "MARKIPLIER",    ch: "UC7_YxT-KID8kRbqZo7MyscQ", cat: "GAMING" },
  { num: 57, name: "JACKSEPTICEYE", ch: "UCYzPXprvl5Y-Sf0g4vX-m6g", cat: "GAMING" },
  { num: 58, name: "NINJA",         ch: "UCAW-NpUFkMyCNrvRSSGIvDQ", cat: "GAMING" },
  { num: 59, name: "VANOSSGAMING",  ch: "UCKqH_9mk1waLgBiL2vT5b9g", cat: "GAMING" },
  { num: 60, name: "MRBEAST GAMING",ch: "UCIPPMRA040LQr5QPyJEbmXA", cat: "GAMING" },
  { num: 61, name: "SIDEMEN",       ch: "UCDogdKl7t7NHzQ95aEwkdMw", cat: "ENTERTAINMENT" },
  { num: 62, name: "KSI",           ch: "UCVtFOytbRpEvzLjvqGG5gxQ", cat: "ENTERTAINMENT" },
  { num: 63, name: "BBC NEWS",      ch: "UC16niRr50-MSBwiO3YDb3RA", cat: "NEWS" },
  { num: 64, name: "CNN",           ch: "UCupvZG-5ko_eiXAupbDfxWw", cat: "NEWS" },
  { num: 65, name: "TONIGHT SHOW",  ch: "UC8-Th83bH_thdKZDJCrn88g", cat: "COMEDY" },
  { num: 66, name: "JIMMY KIMMEL",  ch: "UCa6vGFO9ty8v5KZJXQxdhaw", cat: "COMEDY" },
  { num: 67, name: "GORDON RAMSAY", ch: "UCIEv3lZ_tNXHzL3ox-_uUGQ", cat: "FOOD" },
  { num: 68, name: "BINGING BABISH",ch: "UCJHA_jMfCvEnv-3kRjTCQXw", cat: "FOOD" },
  { num: 69, name: "SMARTER E/DAY", ch: "UC6107grRI4m0o2-emgoDnAA", cat: "SCIENCE" },
  { num: 70, name: "MINUTEPHYSICS", ch: "UCUHW94eEFW7hkUMVaZz4eDg", cat: "SCIENCE" },
  { num: 71, name: "SLOW MO GUYS",  ch: "UCUK0HBIBWgM2c4vsPhkYY4w", cat: "SCIENCE" },
  { num: 72, name: "UNBOX THERAPY", ch: "UCsTcErHg8oDvUnTzoqsYeNw", cat: "TECH" },
  { num: 73, name: "PINKFONG",      ch: "UCcdwLMPsaU2ezNSJU1nFoBQ", cat: "KIDS" },
  { num: 74, name: "CHUCHU TV",     ch: "UCovX7uyW8Fz_-rl3Uj4HRzg", cat: "KIDS" },
  { num: 75, name: "BABYBUS",       ch: "UCpybQg-DJF0Crp-Y4i_TLOA", cat: "KIDS" },
];

/* uploads playlist id for a channel (UC… -> UU…) */
const uploadsOf = (i) => "UU" + CHANNELS[i].ch.slice(2);
const showsOf = (ch) => [ch.cat, "Latest Uploads", "Top Videos"];

const SEGMENTS = 15;
const VOL_STEP = 10;
const DEFAULT_VOL = 60;

let player;
let playerReady = false;
let index = 0;
let isOn = false;
let tuned = false;
let volume = 0;        // starts muted so the video can autoplay on mobile
let errCount = 0;      // consecutive embed failures (caps the auto-surf)
let onErrorSkip;       // timer handle for auto-surfing past dead channels

const $ = (id) => document.getElementById(id);
const els = {
  screen: $("screen"), guide: $("guide"),
  promoNow: $("promoNow"), promoClock: $("promoClock"), previewTag: $("previewTag"),
  previewWindow: $("previewWindow"),
  listingsRows: $("listingsRows"), listingsViewport: $("listingsViewport"),
  noSignal: $("noSignal"), nsText: $("nsText"),
  chanBug: $("chanBug"), bugNum: $("bugNum"), bugName: $("bugName"), bugTitle: $("bugTitle"), guideChip: $("guideChip"),
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
    playerVars: {
      autoplay: 0, controls: 0, rel: 0, iv_load_policy: 3, playsinline: 1, mute: 1,
      origin: location.origin, listType: "playlist", list: uploadsOf(index),
    },
    events: {
      onReady: () => {
        playerReady = true;
        player.mute();
        if (isOn) playCurrent(); // start playing if powered on before the API loaded
      },
      onStateChange: (e) => {
        if (e.data === YT.PlayerState.PLAYING) {
          setStatic(false); hideNoSignal(); errCount = 0;
          applyVideoData();
          // author/title can lag a beat after PLAYING fires
          setTimeout(applyVideoData, 700);
        }
      },
      onError: () => {
        showNoSignal("NO SIGNAL", "CHANNEL UNAVAILABLE");
        // while watching, automatically surf past channels that won't embed
        if (tuned && errCount++ < 6) {
          clearTimeout(onErrorSkip);
          onErrorSkip = setTimeout(() => { if (tuned) changeChannel(1); }, 2600);
        }
      },
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
  const rowHTML = (ch, i) => {
    const s = showsOf(ch);
    return `
    <div class="row${i === index ? " current" : ""}" data-i="${i}" role="button" tabindex="0"
         aria-label="Watch channel ${ch.num} ${ch.name}">
      <div class="cell cell-ch"><b>${ch.num}</b>${ch.name}</div>
      <div class="cell">${s[0]}</div>
      <div class="cell">${s[1]}</div>
      <div class="cell">${s[2]}</div>
    </div>`;
  };
  const once = CHANNELS.map(rowHTML).join("");
  els.listingsRows.innerHTML = once + once; // duplicate for seamless loop
}

function updatePromo() {
  const ch = CHANNELS[index];
  // show the curated name immediately; applyVideoData() corrects it to the
  // real channel/title once the video starts playing
  els.promoNow.textContent = `NOW: CH ${ch.num} ${ch.name} — ${ch.cat}`;
  els.previewTag.textContent = `CH ${ch.num} ${ch.name}`;
  els.bugNum.textContent = pad(ch.num);
  els.bugName.textContent = ch.name;
  els.bugTitle.textContent = "";
  document.querySelectorAll(".row").forEach((r) => r.classList.toggle("current", Number(r.dataset.i) === index));
}

/* Replace labels with the REAL channel + video title reported by the player,
 * so what's on screen always matches what's actually playing. */
function applyVideoData() {
  if (!playerReady || typeof player.getVideoData !== "function") return;
  const d = player.getVideoData() || {};
  const ch = CHANNELS[index];
  const channelName = d.author || ch.name;
  const videoTitle = d.title || "";
  els.bugName.textContent = channelName;
  els.bugTitle.textContent = videoTitle;
  els.previewTag.textContent = `CH ${ch.num} ${channelName}`;
  els.promoNow.textContent = videoTitle
    ? `NOW: ${channelName} — ${videoTitle}`
    : `NOW: CH ${ch.num} ${channelName}`;
  // if the channel OSD is still on screen, correct its name too
  if (els.osdCh.classList.contains("show")) els.osdChName.textContent = channelName;
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
  clearTimeout(onErrorSkip);
  glitch();
  if (!playerReady) return;
  setTimeout(() => {
    player.loadPlaylist({ list: uploadsOf(index), listType: "playlist", index: 0 });
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
