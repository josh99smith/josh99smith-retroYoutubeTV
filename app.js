/* Retro YouTube TV
 * A CRT-styled YouTube player with channel switching and static transitions.
 *
 * Channels are just YouTube video IDs. Add/remove freely.
 * To make a channel a live "broadcast", set live:true (it will start near 0).
 */

const CHANNELS = [
  { name: "Lo-Fi Beats", id: "jfKfPfyJRdk" },        // lofi hip hop radio
  { name: "Nature Relaxation", id: "BHACKCNDMW8" },  // 4k nature
  { name: "Classic Cartoons Vibes", id: "5qap5aO4i9A" },
  { name: "Synthwave Drive", id: "4xDzrJKXOOY" },
  { name: "Coffee Jazz", id: "Dx5qFachd3A" },
  { name: "Space / NASA", id: "21X5lGlDOfg" },
];

let player;
let playerReady = false;
let currentChannel = 0;
let isOn = false;

const els = {
  static: document.getElementById("static"),
  osd: document.getElementById("osd"),
  powerOff: document.getElementById("powerOff"),
  screen: document.getElementById("screen"),
  channelReadout: document.getElementById("channelReadout"),
  nowPlaying: document.getElementById("nowPlaying"),
  powerBtn: document.getElementById("powerBtn"),
  chUp: document.getElementById("chUp"),
  chDown: document.getElementById("chDown"),
  volume: document.getElementById("volume"),
};

// Called automatically by the YouTube IFrame API script.
function onYouTubeIframeAPIReady() {
  player = new YT.Player("player", {
    width: "100%",
    height: "100%",
    videoId: CHANNELS[currentChannel].id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
      rel: 0,
      iv_load_policy: 3,
      playsinline: 1,
    },
    events: {
      onReady: () => {
        playerReady = true;
        player.setVolume(Number(els.volume.value));
        updateReadout();
      },
      onStateChange: onPlayerStateChange,
    },
  });
}
// expose for the API callback
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function onPlayerStateChange(e) {
  if (e.data === YT.PlayerState.PLAYING) {
    setStatic(false);
  }
}

function pad(n) {
  return String(n + 1).padStart(2, "0");
}

function updateReadout() {
  els.channelReadout.textContent = pad(currentChannel);
  els.osd.textContent = "CH " + pad(currentChannel);
  els.nowPlaying.textContent = isOn
    ? "Now playing: " + CHANNELS[currentChannel].name
    : "— TV is off —";
}

function flashOSD() {
  els.osd.classList.add("show");
  clearTimeout(flashOSD._t);
  flashOSD._t = setTimeout(() => els.osd.classList.remove("show"), 1600);
}

function setStatic(on) {
  els.static.classList.toggle("on", on);
}

function loadChannel(index) {
  currentChannel = (index + CHANNELS.length) % CHANNELS.length;
  updateReadout();
  flashOSD();

  if (!isOn || !playerReady) return;

  // burst of static while we switch
  setStatic(true);
  setTimeout(() => {
    player.loadVideoById(CHANNELS[currentChannel].id);
    player.playVideo();
  }, 350);
  // safety: clear static even if PLAYING event is slow
  setTimeout(() => setStatic(false), 2500);
}

function powerOn() {
  isOn = true;
  els.powerOff.classList.add("hidden");
  els.screen.classList.remove("turning-off");
  updateReadout();
  flashOSD();

  if (playerReady) {
    setStatic(true);
    player.loadVideoById(CHANNELS[currentChannel].id);
    player.playVideo();
    setTimeout(() => setStatic(false), 1800);
  }
}

function powerOff() {
  isOn = false;
  if (playerReady) player.pauseVideo();
  setStatic(false);
  els.screen.classList.add("turning-off");
  setTimeout(() => {
    els.powerOff.classList.remove("hidden");
    els.screen.classList.remove("turning-off");
  }, 450);
  updateReadout();
}

function togglePower() {
  isOn ? powerOff() : powerOn();
}

// ---------- Events ----------
els.powerBtn.addEventListener("click", togglePower);
els.chUp.addEventListener("click", () => loadChannel(currentChannel + 1));
els.chDown.addEventListener("click", () => loadChannel(currentChannel - 1));
els.volume.addEventListener("input", () => {
  if (playerReady) player.setVolume(Number(els.volume.value));
});

// Keyboard: P = power, arrows = channel
document.addEventListener("keydown", (e) => {
  if (e.key === "p" || e.key === "P") togglePower();
  if (!isOn) return;
  if (e.key === "ArrowUp" || e.key === "ArrowRight") loadChannel(currentChannel + 1);
  if (e.key === "ArrowDown" || e.key === "ArrowLeft") loadChannel(currentChannel - 1);
});

// Initial state
updateReadout();
