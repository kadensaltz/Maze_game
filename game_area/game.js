// === Utilities & Globals ===
function returnToMainMenu() {
  window.location.href = 
    "https://kadensaltz.github.io/Maze_game/main_menu/index.html";
}

const maze = document.getElementById("maze");
let currentLevelNumber = 1;
let currentLevelData = null;

const MAX_LEVELS = 10;

// total elapsed time (ms) over all levels / partial runs
let totalTimeMs = 0;

// per‐level timer start
let startTime = 0;
let timerPaused = true;
const timerElement = document.getElementById("timer");

// === Timer ===
function updateTimer() {
  if (!timerPaused) {
    // show accumulated + current
    const now = Date.now();
    const elapsedMs = totalTimeMs + (now - startTime);
    timerElement.textContent = `Time: ${(elapsedMs/1000).toFixed(2)}s`;
  }
  requestAnimationFrame(updateTimer);
}

function pauseTimer() {
  timerPaused = true;
}

function resumeTimer() {
  timerPaused = false;
  startTime = Date.now();
}

// === Alerts & Overlays ===
function showCustomAlert(message) {
  document.getElementById("alert-message").textContent = message;
  document.getElementById("custom-alert").style.display = "flex";
  pauseTimer();
}

function showCompletedAlert() {
  document.getElementById("completed-alert").style.display = "flex";
  pauseTimer();
}

// central prompt for the leaderboard
const usernamePromptOverlay = 
  document.getElementById("username-prompt-overlay");
const usernameInput        = 
  document.getElementById("username-input");
const submitUsernameButton = 
  document.getElementById("submit-username-button");
const cancelUsernameButton = 
  document.getElementById("cancel-username-button");

function showUsernamePrompt() {
  usernamePromptOverlay.style.display = "flex";
}

// when they finally submit their name:
submitUsernameButton.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Please enter your name!");
  // compute total seconds
  const totalSec = (totalTimeMs/1000).toFixed(2);
  const board = JSON.parse(localStorage.getItem("leaderboard")||"[]");
  board.push({ name, time: parseFloat(totalSec) });
  localStorage.setItem("leaderboard", JSON.stringify(board));

  // now go back
  returnToMainMenu();
});

// if they skip entering a name
cancelUsernameButton.addEventListener("click", () => {
  returnToMainMenu();
});

// === Escape / Leave‐Page / Right‐Click ===
// helper to accumulate partial time & then prompt
function leaveAndPrompt() {
  // stop timer and add partial
  pauseTimer();
  totalTimeMs += (Date.now() - startTime);
  // hide any open overlays
  document.querySelectorAll(".overlay, .custom-alert")
          .forEach(el => el.style.display = "none");
  // now ask for name
  showUsernamePrompt();
}

// Escape key → confirmation overlay
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.getElementById("escape-overlay").style.display = "flex";
    pauseTimer();
  }
});
document.getElementById("confirm-back")
        .addEventListener("click", leaveAndPrompt);
document.getElementById("cancel-back")
        .addEventListener("click", () => {
  document.getElementById("escape-overlay").style.display = "none";
  resumeTimer();
});

// blur/visibility → leave‐page
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
document.getElementById("leave-alert-restart")
        .addEventListener("click", () => {
  document.getElementById("leave-page-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});
document.getElementById("leave-alert-mainmenu")
        .addEventListener("click", leaveAndPrompt);

// right‐click → custom alert
document.addEventListener("contextmenu", e => {
  e.preventDefault();
  document.getElementById("right-click-alert").style.display = "flex";
  pauseTimer();
});
document.getElementById("right-click-restart")
        .addEventListener("click", () => {
  document.getElementById("right-click-alert").style.display = "none";
  loadLevel(currentLevelNumber);
});
document.getElementById("right-click-mainmenu")
        .addEventListener("click", leaveAndPrompt);

// === Game Over (wall hit) ===
document.getElementById("alert-restart")
        .addEventListener("click", () => {
  document.getElementById("custom-alert").style.display = "none";
  // do NOT prompt on loss; just restart same level
  loadLevel(currentLevelNumber);
});
document.getElementById("alert-mainmenu")
        .addEventListener("click", returnToMainMenu);

// === Completed Alert “Return” Button (mid‐run exit) ===
document.getElementById("alert-mainmenu-complete")
        .addEventListener("click", leaveAndPrompt);

// === Next Level (only shown mid‐run) ===
document.getElementById("next-level")
        .addEventListener("click", () => {
  document.getElementById("completed-alert").style.display = "none";
  loadLevel(currentLevelNumber + 1);
});

// === Phase 2: build walls + END + hook completion ===
function finalizeLevelLoad(data) {
  // clear old walls
  maze.querySelectorAll(".wall").forEach(w=>w.remove());

  // draw walls
  data.walls.forEach(w => {
    const div = document.createElement("div");
    div.className = "wall";
    div.style.cssText = `
      left:  ${w.x}%;
      top:   ${w.y}%;
      width: ${w.width}%;
      height:${w.height}%;
    `;
    div.addEventListener("mouseenter", () =>
      showCustomAlert("Game Over! You touched a wall.")
    );
    maze.appendChild(div);
  });

  // draw & hook END
  let oldEnd = maze.querySelector(".end");
  const newEnd = oldEnd.cloneNode(true);
  oldEnd.replaceWith(newEnd);
  newEnd.style.cssText = `
    left: ${data.end.x}%;
    top:  ${data.end.y}%;
    display: block;
  `;
  newEnd.textContent = "END";

  // when they touch END:
  function onEnd() {
    newEnd.removeEventListener("mouseenter", onEnd);
    // accumulate this level’s time
    pauseTimer();
    totalTimeMs += (Date.now() - startTime);

    if (currentLevelNumber < MAX_LEVELS) {
      showCompletedAlert();
    } else {
      showUsernamePrompt();
    }
  }
  newEnd.addEventListener("mouseenter", onEnd);

  // start timer
  resumeTimer();
}

// === Phase 1: fetch JSON, show START → wait for hover ===
async function loadLevel(n) {
  currentLevelNumber = n;
  try {
    const res = await fetch(`levels/level_${String(n).padStart(2,"0")}.json`);
    if (!res.ok) throw new Error(res.status);
    const data = await res.json();
    currentLevelData = data;

    // clear walls & hide END
    maze.querySelectorAll(".wall").forEach(w=>w.remove());
    maze.querySelector(".end").style.display = "none";

    // position & show START
    const startEl = maze.querySelector(".start");
    startEl.style.cssText = `
      left: ${data.start.x}%;
      top:  ${data.start.y}%;
      display: block;
    `;
    startEl.textContent = "START";

    // wait for them to hover
    pauseTimer();
    function onStart() {
      startEl.removeEventListener("mouseenter", onStart);
      finalizeLevelLoad(data);
    }
    startEl.addEventListener("mouseenter", onStart);

  } catch (err) {
    console.error("Failed to load level", err);
    alert("Error loading level. Returning to menu.");
    returnToMainMenu();
  }
}

// === Boot ===
updateTimer();
const params = new URLSearchParams(window.location.search);
const initial = parseInt(params.get("level"));
loadLevel(
  initial >= 1 && initial <= MAX_LEVELS
    ? initial
    : 1
);
