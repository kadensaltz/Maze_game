// === Globals & Helpers ===
const maze   = document.getElementById("maze");
const timerE = document.getElementById("timer");

let currentLevelNumber = 1;
const MAX_LEVELS = 10;

// total elapsed time (ms) across levels
let totalTimeMs = 0;
// per‐level start timestamp
let startTime   = 0;
let timerPaused = true;

// record each finished level’s raw ms
const runLevelTimes = [];

/** Progression lock **/
function getMaxUnlockedLevel() {
  return parseInt(localStorage.getItem("maxUnlockedLevel") || "1", 10);
}
function setMaxUnlockedLevel(level) {
  localStorage.setItem("maxUnlockedLevel", String(level));
}

/** Redirect helper **/
function goMainMenu() {
  window.location.href = 
    "https://kadensaltz.github.io/Maze_game/main_menu/index.html";
}

// === Timer ===
function updateTimer() {
  if (!timerPaused) {
    const now      = Date.now();
    const elapsed  = totalTimeMs + (now - startTime);
    timerE.textContent = `Time: ${(elapsed/1000).toFixed(2)}s`;
  }
  requestAnimationFrame(updateTimer);
}
function pauseTimer()  { timerPaused = true; }
function resumeTimer() { timerPaused = false; startTime = Date.now(); }

// === Username Prompt (full‐run & per‐level storage) ===
const userOverlay = document.getElementById("username-prompt-overlay");
const userInput   = document.getElementById("username-input");
const btnSubmit   = document.getElementById("submit-username-button");
const btnSkip     = document.getElementById("cancel-username-button");

function showUserPrompt() {
  userOverlay.style.display = "flex";
}

// Submit final scores
btnSubmit.addEventListener("click", () => {
  const name = userInput.value.trim();
  if (!name) return alert("Please enter your name!");

  // 1) Full-run
  const fullSec = parseFloat((totalTimeMs/1000).toFixed(2));
  const fullRuns = JSON.parse(localStorage.getItem("fullRunTimes") || "[]");
  fullRuns.push({ name, time: fullSec });
  localStorage.setItem("fullRunTimes", JSON.stringify(fullRuns));

  // 2) Per-level
  const perLevels = JSON.parse(localStorage.getItem("perLevelTimes") || "{}");
  runLevelTimes.forEach(({ level, time }) => {
    const lvlKey = String(level);
    const sec = parseFloat((time/1000).toFixed(2));
    perLevels[lvlKey] = perLevels[lvlKey] || [];
    perLevels[lvlKey].push({ name, time: sec });
  });
  localStorage.setItem("perLevelTimes", JSON.stringify(perLevels));

  goMainMenu();
});

// Skip name entry
btnSkip.addEventListener("click", goMainMenu);

// === Central “exit” handler: accumulate time & prompt ===
function leaveAndPrompt() {
  pauseTimer();
  totalTimeMs += Date.now() - startTime;
  // hide everything
  document.querySelectorAll(".overlay, .custom-alert")
          .forEach(el => el.style.display = "none");
  showUserPrompt();
}

// Wire up *all* “Return to Main Menu” buttons to leaveAndPrompt()
[
  "confirm-back",
  "alert-mainmenu",
  "alert-mainmenu-complete",
  "leave-alert-mainmenu",
  "right-click-mainmenu"
].forEach(id => {
  document.getElementById(id)
          .addEventListener("click", leaveAndPrompt);
});

// === Other Alerts & Restarts ===
// Cancel escape
document.getElementById("cancel-back")
        .addEventListener("click", () => {
  document.getElementById("escape-overlay").style.display = "none";
  resumeTimer();
});

// Restart after wall-hit
document.getElementById("alert-restart")
        .addEventListener("click", () => {
  document.getElementById("custom-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});

// Restart after leaving page
document.getElementById("leave-alert-restart")
        .addEventListener("click", () => {
  document.getElementById("leave-page-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});

// Restart after right-click
document.getElementById("right-click-restart")
        .addEventListener("click", () => {
  document.getElementById("right-click-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});

// Next Level button
document.getElementById("next-level")
        .addEventListener("click", () => {
  document.getElementById("completed-alert").style.display = "none";
  loadLevel(currentLevelNumber + 1);
});

// Pause on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("escape-overlay").style.display = "flex";
    pauseTimer();
  }
});
// Leave‐page handlers
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.getElementById("leave-page-alert").style.display = "flex";
    pauseTimer();
  }
});
window.addEventListener("blur", () => {
  document.getElementById("leave-page-alert").style.display = "flex";
  pauseTimer();
});
// Block right-click
document.addEventListener("contextmenu", e => {
  e.preventDefault();
  document.getElementById("right-click-alert").style.display = "flex";
  pauseTimer();
});

// === Helpers for showing alerts ===
function showGameOver(msg) {
  document.getElementById("alert-message").textContent = msg;
  document.getElementById("custom-alert").style.display = "flex";
  pauseTimer();
}
function showLevelComplete() {
  document.getElementById("completed-alert").style.display = "flex";
  pauseTimer();
}

// === Phase 2: build walls + END & handle completion ===
function finalizeLevelLoad(data) {
  // clear old walls
  maze.querySelectorAll(".wall").forEach(w => w.remove());

  // draw walls
  data.walls.forEach(w => {
    const d = document.createElement("div");
    d.className = "wall";
    d.style.cssText = `
      left:  ${w.x}%;
      top:   ${w.y}%;
      width: ${w.width}%;
      height:${w.height}%;
    `;
    d.addEventListener("mouseenter", () =>
      showGameOver("Game Over! You touched a wall.")
    );
    maze.appendChild(d);
  });

  // place & hook END
  const oldEnd = maze.querySelector(".end");
  const newEnd = oldEnd.cloneNode(true);
  oldEnd.replaceWith(newEnd);
  newEnd.style.cssText = `
    left: ${data.end.x}%;
    top:  ${data.end.y}%;
    display: block;
  `;
  newEnd.textContent = "END";

  newEnd.addEventListener("mouseenter", () => {
    // record this level’s time
    pauseTimer();
    const levelMs = Date.now() - startTime;
    totalTimeMs += levelMs;
    runLevelTimes.push({ level: currentLevelNumber, time: levelMs });

    // unlock progression
// unlock next level (but never above MAX_LEVELS)
if (currentLevelNumber < MAX_LEVELS) {
  const next = currentLevelNumber + 1;
  if (next > getMaxUnlockedLevel()) {
    setMaxUnlockedLevel(next);
  }
}


    if (currentLevelNumber < MAX_LEVELS) {
      showLevelComplete();
    } else {
      showUserPrompt();
    }
  });

  // start timer
  resumeTimer();
}

// === Phase 1: fetch JSON → show START & wait for hover ===
async function loadLevel(n) {
  currentLevelNumber = n;
  try {
    const res = await fetch(`./levels/level_${String(n).padStart(2,"0")}.json`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    // clear walls & hide old END
    maze.querySelectorAll(".wall").forEach(w => w.remove());
    maze.querySelector(".end").style.display = "none";

    // position & show START
    const s = maze.querySelector(".start");
    s.style.cssText = `
      left: ${data.start.x}%;
      top:  ${data.start.y}%;
      display: block;
    `;
    s.textContent = "START";

    // pause & await hover
    pauseTimer();
    function onStart() {
      s.removeEventListener("mouseenter", onStart);
      finalizeLevelLoad(data);
    }
    s.addEventListener("mouseenter", onStart);

  } catch (err) {
    console.error("Level load failed:", err);
    alert("Could not load that level. Returning to menu.");
    goMainMenu();
  }
}

// === Bootstrap ===
updateTimer();
const params = new URLSearchParams(window.location.search);
const lvl    = parseInt(params.get("level"), 10);
loadLevel((lvl >= 1 && lvl <= MAX_LEVELS) ? lvl : 1);
