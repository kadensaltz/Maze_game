// === Globals & Helpers ===
const maze   = document.getElementById("maze");
const timerE = document.getElementById("timer");
let currentLevelNumber = 1;
const MAX_LEVELS = 10;

// Tracks total elapsed ms (across levels and partial runs)
let totalTimeMs = 0;
let startTime   = 0;
let timerPaused = true;

// Shortcut to navigate away
function goMainMenu() {
  window.location.href = "https://kadensaltz.github.io/Maze_game/main_menu/index.html";
}

// === Timer ===
function updateTimer() {
  if (!timerPaused) {
    const now = Date.now();
    const elapsed = totalTimeMs + (now - startTime);
    timerE.textContent = `Time: ${(elapsed/1000).toFixed(2)}s`;
  }
  requestAnimationFrame(updateTimer);
}

function pauseTimer()  { timerPaused = true; }
function resumeTimer() { timerPaused = false; startTime = Date.now(); }

// === Username Prompt ===
const userOverlay = document.getElementById("username-prompt-overlay");
const userInput   = document.getElementById("username-input");
const btnSubmit   = document.getElementById("submit-username-button");
const btnSkip     = document.getElementById("cancel-username-button");

function showUserPrompt() {
  userOverlay.style.display = "flex";
}

// Submit their name & total time, then go to main menu
btnSubmit.addEventListener("click", () => {
  const name = userInput.value.trim();
  if (!name) return alert("Please enter your name!");
  const secs = parseFloat(((totalTimeMs)/1000).toFixed(2));
  const board = JSON.parse(localStorage.getItem("leaderboard")||"[]");
  board.push({ name, time: secs });
  localStorage.setItem("leaderboard", JSON.stringify(board));
  goMainMenu();
});

// Skip entering name
btnSkip.addEventListener("click", goMainMenu);

// === Central “leave now” handler ===
function leaveAndPrompt() {
  pauseTimer();
  totalTimeMs += Date.now() - startTime;
  // hide all overlays/alerts
  document.querySelectorAll(".overlay, .custom-alert").forEach(el => el.style.display = "none");
  showUserPrompt();
}

// === Wire up every Return-to-MainMenu button to leaveAndPrompt ===
document.getElementById("confirm-back")
        .addEventListener("click", leaveAndPrompt);
document.getElementById("alert-mainmenu")
        .addEventListener("click", leaveAndPrompt);
document.getElementById("alert-mainmenu-complete")
        .addEventListener("click", leaveAndPrompt);
document.getElementById("leave-alert-mainmenu")
        .addEventListener("click", leaveAndPrompt);
document.getElementById("right-click-mainmenu")
        .addEventListener("click", leaveAndPrompt);

// === Other Alerts & Handlers ===
// Canceling the escape prompt
document.getElementById("cancel-back")
        .addEventListener("click", () => {
  document.getElementById("escape-overlay").style.display = "none";
  resumeTimer();
});

// Restart on game-over
document.getElementById("alert-restart")
        .addEventListener("click", () => {
  document.getElementById("custom-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});

// Restart on leave-page alert
document.getElementById("leave-alert-restart")
        .addEventListener("click", () => {
  document.getElementById("leave-page-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});

// Restart on right-click alert
document.getElementById("right-click-restart")
        .addEventListener("click", () => {
  document.getElementById("right-click-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});

// Next level button
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

// Leave-the-tab handlers
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

// === Custom Alerts Helpers ===
function showGameOver(msg) {
  document.getElementById("alert-message").textContent = msg;
  document.getElementById("custom-alert").style.display = "flex";
  pauseTimer();
}
function showLevelComplete() {
  document.getElementById("completed-alert").style.display = "flex";
  pauseTimer();
}

// === Phase 2: build walls + end → hook completion ===
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
    d.addEventListener("mouseenter", () => showGameOver("Game Over! You touched a wall."));
    maze.appendChild(d);
  });

  // place & hook the END
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
    // finalize this level’s time
    pauseTimer();
    totalTimeMs += Date.now() - startTime;

    if (currentLevelNumber < MAX_LEVELS) {
      showLevelComplete();
    } else {
      showUserPrompt();
    }
  });

  // kick the timer off
  resumeTimer();
}

// === Phase 1: fetch JSON, draw START, wait for hover ===
async function loadLevel(n) {
  currentLevelNumber = n;
  try {
    const res = await fetch(`./levels/level_${String(n).padStart(2,"0")}.json`);
    if (!res.ok) throw new Error(res.statusText);
    const data = await res.json();

    // clear old walls + hide any old end
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

    // pause & wait for first hover
    pauseTimer();
    function onStart() {
      s.removeEventListener("mouseenter", onStart);
      finalizeLevelLoad(data);
    }
    s.addEventListener("mouseenter", onStart);

  } catch (err) {
    console.error("Level load failed:", err);
    alert("Could not load that level. Returning to main menu.");
    goMainMenu();
  }
}

// === Bootstrap ===
updateTimer();
const p = new URLSearchParams(window.location.search);
const lvl = parseInt(p.get("level"));
loadLevel((lvl >= 1 && lvl <= MAX_LEVELS) ? lvl : 1);
