// Reusable function to redirect to the main menu
function returnToMainMenu() {
  window.location.href = "https://kadensaltz.github.io/Maze_game/main_menu/index.html";
}

let currentLevelNumber = 1;
const maze = document.getElementById("maze"); // Maze container
let currentFetchedLevelData = null; // To store fetched level data for finalizeLevelLoad

// Timer logic
let startTime = Date.now(); // Start time will be reset when the game restarts
let timerPaused = false; // Flag to check if the timer is paused

const timerElement = document.getElementById("timer");

function updateTimer() {
  if (!timerPaused) {
    const elapsed = (Date.now() - startTime) / 1000; // Time in seconds
    timerElement.textContent = `Time: ${elapsed.toFixed(2)}s`;
  }
  requestAnimationFrame(updateTimer); // Keeps updating the timer
}

// Show custom alert with a custom message
function showCustomAlert(message) {
  const customAlert = document.getElementById("custom-alert");
  const alertMessage = document.getElementById("alert-message");
  alertMessage.textContent = message;
  customAlert.style.display = "flex"; // Show the custom alert
  pauseTimer(); // Pause the timer when the alert is shown
}

// Show completed alert (when the maze is finished)
function showCompletedAlert() {
  pauseTimer(); // Pause timer immediately

  // Hide other alerts/overlays just in case
  // Ensure these elements exist before trying to change their style to prevent errors if HTML changes
  const customAlert = document.getElementById('custom-alert');
  if (customAlert) customAlert.style.display = 'none';

  const escapeOverlay = document.getElementById('escape-overlay');
  if (escapeOverlay) escapeOverlay.style.display = 'none';

  // document.getElementById('start-overlay').style.display = 'none'; // Usually not needed here

  // Clear previous username input
  if(usernameInput) usernameInput.value = '';

  if(usernamePromptOverlay) usernamePromptOverlay.style.display = 'flex'; // Show username prompt FIRST
  // The original 'completed-alert' is now shown after this prompt is handled.
}

// Pause the timer
function pauseTimer() {
  timerPaused = true;
}

// Resume the timer
function resumeTimer() {
  timerPaused = false;
  startTime = Date.now(); // Reset the start time to now, ensuring the timer continues from the correct point
}

// Show escape overlay
function showEscapeOverlay() {
  const escapeOverlay = document.getElementById("escape-overlay");
  escapeOverlay.style.display = "flex";
  pauseTimer(); // Pause the timer when the escape overlay is shown
}

// Event listener for Escape key to show escape overlay
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    showEscapeOverlay();
  }
});

// Handling the escape overlay buttons
const confirmBack = document.getElementById("confirm-back");
const cancelBack = document.getElementById("cancel-back");

// Username Prompt Elements
const usernamePromptOverlay = document.getElementById('username-prompt-overlay');
const usernameInput = document.getElementById('username-input');
const submitUsernameButton = document.getElementById('submit-username-button');
const cancelUsernameButton = document.getElementById('cancel-username-button');

confirmBack.addEventListener("click", returnToMainMenu);

cancelBack.addEventListener("click", () => {
  const escapeOverlay = document.getElementById("escape-overlay");
  escapeOverlay.style.display = "none"; // Close the escape overlay
  resumeTimer(); // Resume the timer when the overlay is closed
});

// Handling the custom alert buttons (Restart Level or Return to Main Menu)
const alertRestart = document.getElementById("alert-restart");
const alertMainMenu = document.getElementById("alert-mainmenu");

alertRestart.addEventListener("click", () => {
  const customAlert = document.getElementById("custom-alert");
  customAlert.style.display = "none"; // Close the custom alert
  // startTime = Date.now(); // Reset by loadLevel
  // resumeTimer(); // Called by loadLevel
  loadLevel(currentLevelNumber); // Reload current level
});

alertMainMenu.addEventListener("click", returnToMainMenu);

// Handling the leave-page alert buttons (Restart Level or Return to Main Menu)
const leavePageAlert = document.getElementById("leave-page-alert");
const leaveAlertRestart = document.getElementById("leave-alert-restart");
const leaveAlertMainMenu = document.getElementById("leave-alert-mainmenu");

// Function to show the leave-page alert
function showLeavePageAlert() {
  leavePageAlert.style.display = "block";
}

function restartLevel() {
  leavePageAlert.style.display = "none"; // Close the leave-page alert
  // startTime = Date.now(); // Reset by loadLevel
  // resumeTimer(); // Called by loadLevel
  loadLevel(currentLevelNumber); // Reload current level
}

// Event listeners for the buttons
leaveAlertRestart.addEventListener("click", restartLevel);
leaveAlertMainMenu.addEventListener("click", returnToMainMenu);

// Page Visibility Detection
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    showLeavePageAlert(); // Trigger the alert when the page is not visible
    pauseTimer(); // Pause the timer when the alert is displayed
  }
});

// Window Focus Detection
window.addEventListener("blur", () => {
  showLeavePageAlert(); // Trigger the alert when the window loses focus
  pauseTimer(); // Pause the timer when the alert is displayed
});

// Prevent closing the alert when the user refocuses
window.addEventListener("focus", () => {
  if (leavePageAlert.style.display === "block") {
    pauseTimer(); // Ensure the timer stays paused until the user interacts with the modal
  }
});

// Handling the completed alert buttons (Next Level or Return to Main Menu)
const nextLevelButton = document.getElementById("next-level");
const alertMainMenuComplete = document.getElementById("alert-mainmenu-complete");

nextLevelButton.addEventListener("click", () => {
  currentLevelNumber++;
  if (currentLevelNumber > 10) { // Assuming 10 levels for now
    alert("Congratulations! You've completed all levels!");
    // Optionally, clear leaderboard prompt related elements if any are visible
    document.getElementById("completed-alert").style.display = "none";
    returnToMainMenu(); // Or redirect to leaderboard
  } else {
    loadLevel(currentLevelNumber);
    document.getElementById("completed-alert").style.display = "none"; // Hide the alert
  }
});

alertMainMenuComplete.addEventListener("click", returnToMainMenu);

// Function to finalize level loading (render walls, start timer)
function finalizeLevelLoad(levelData) {
  if (!levelData) {
    console.error("No level data to finalize loading.");
    returnToMainMenu(); // Or show an error
    return;
  }

  // Clear existing maze elements (walls) - Should be done before new walls are added
  const existingWalls = maze.querySelectorAll(".wall");
  existingWalls.forEach(wall => wall.remove());

  // Render Walls
  levelData.walls.forEach(wallData => {
    const wallElement = document.createElement('div');
    wallElement.classList.add('wall');
    wallElement.style.position = 'absolute';
    wallElement.style.left = wallData.x + '%';
    wallElement.style.top = wallData.y + '%';
    wallElement.style.width = wallData.width + '%';
    wallElement.style.height = wallData.height + '%';
    wallElement.style.backgroundColor = 'blue'; // Or use CSS for wall styling
    maze.appendChild(wallElement);
    wallElement.addEventListener("mouseenter", () => {
      showCustomAlert("Game Over! You touched a wall.");
    });
  });

  // Reset timer and start it
  startTime = Date.now();
  resumeTimer(); // Make sure timer is running
}

// Function to load level data and prepare for starting
async function loadLevel(levelNumber) {
  currentLevelNumber = levelNumber;
  const levelFile = `levels/level_${String(levelNumber).padStart(2, '0')}.json`;

  try {
    const response = await fetch(levelFile);
    if (!response.ok) {
      throw new Error(`Could not load level ${levelNumber}: ${response.statusText}`);
    }
    const levelData = await response.json();
    currentFetchedLevelData = levelData; // Store for finalizeLevelLoad

    // Clear existing maze elements (walls) - Moved to finalizeLevelLoad, but ensure maze is clean before overlay
    const wallsToClearBeforeOverlay = maze.querySelectorAll(".wall");
    wallsToClearBeforeOverlay.forEach(wall => wall.remove());


    // Position Start element
    let startElement = document.querySelector(".start");
    if (!startElement) { // Should exist from HTML, but as a fallback
        startElement = document.createElement('div');
        startElement.classList.add('start');
        maze.appendChild(startElement);
    }
    startElement.style.position = 'absolute';
    startElement.style.left = levelData.start.x + '%';
    startElement.style.top = levelData.start.y + '%';
    startElement.textContent = 'START';
    startElement.style.backgroundColor = 'blue';
    startElement.style.color = 'white';
    startElement.style.padding = '5px 10px';
    startElement.style.textAlign = 'center';
    startElement.style.width = 'auto';
    startElement.style.height = 'auto';


    // Render End - Apply styles before cloning for event listener
    let endElement = document.querySelector(".end");
    if (!endElement) { // Should exist from HTML
        endElement = document.createElement('div');
        endElement.classList.add('end');
        maze.appendChild(endElement);
    }
    endElement.style.position = 'absolute';
    endElement.style.left = levelData.end.x + '%';
    endElement.style.top = levelData.end.y + '%';
    endElement.textContent = 'END';
    endElement.style.backgroundColor = 'red';
    endElement.style.color = 'white';
    endElement.style.padding = '5px 10px';
    endElement.style.textAlign = 'center';
    endElement.style.width = 'auto';
    endElement.style.height = 'auto';

    // Remove old listener before adding a new one to prevent duplicates for end element
    // Important: Clone the styled endElement
    const newEndElement = endElement.cloneNode(true);
    endElement.parentNode.replaceChild(newEndElement, endElement);
    newEndElement.addEventListener("mouseenter", showCompletedAlert);

    // Show the start overlay
    document.getElementById('start-overlay').style.display = 'flex';
    pauseTimer(); // Pause timer; it will be reset and started in finalizeLevelLoad

  } catch (error) {
    console.error("Error loading level:", error);
    currentFetchedLevelData = null; // Clear data on error
    alert("Failed to load level data. Returning to main menu.");
    returnToMainMenu();
  }
}

// Start the timer
updateTimer();

// Initial Load Logic
const confirmStartButton = document.getElementById('confirm-start');
const startOverlay = document.getElementById('start-overlay');

if (confirmStartButton && startOverlay) { // Ensure elements exist
  confirmStartButton.addEventListener('click', () => {
    startOverlay.style.display = 'none';
    if (currentFetchedLevelData) {
      finalizeLevelLoad(currentFetchedLevelData);
    } else {
      console.error("Attempted to start level without fetched data.");
      loadLevel(1); // Fallback or show error message
    }
  });
}

// Event listeners for the username prompt
if (submitUsernameButton && usernamePromptOverlay && usernameInput) { // Ensure elements exist
  submitUsernameButton.addEventListener('click', () => {
    const playerName = usernameInput.value.trim();
    if (playerName) {
      // Logic moved from original showCompletedAlert:
      let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
      const time = parseFloat(timerElement.textContent.replace('Time: ', '').replace('s', ''));
      leaderboard.push({ name: playerName, time: time, level: currentLevelNumber });
      localStorage.setItem('leaderboard', JSON.stringify(leaderboard));

      usernameInput.value = ''; // Clear input
      usernamePromptOverlay.style.display = 'none';
      // Show the original "completed-alert" again to offer "Next Level" or "Main Menu"
      const completedAlert = document.getElementById('completed-alert');
      if (completedAlert) completedAlert.style.display = 'flex';
    } else {
      // Optionally, show a small error message or just don't close the prompt
      alert("Please enter a name!"); // Or a more styled error
    }
  });
}

if (cancelUsernameButton && usernamePromptOverlay && usernameInput) { // Ensure elements exist
  cancelUsernameButton.addEventListener('click', () => {
      usernameInput.value = ''; // Clear input
      usernamePromptOverlay.style.display = 'none';
      // Show the original "completed-alert" again to offer "Next Level" or "Main Menu"
      const completedAlert = document.getElementById('completed-alert');
      if (completedAlert) completedAlert.style.display = 'flex';
  });
}

const urlParams = new URLSearchParams(window.location.search);
const levelFromUrl = parseInt(urlParams.get('level'));
  } else {
    console.error("Attempted to start level without fetched data.");
    // Optionally, try to load default level or show error
    loadLevel(1); // Fallback or show error message
  }
});

const urlParams = new URLSearchParams(window.location.search);
const levelFromUrl = parseInt(urlParams.get('level'));

if (levelFromUrl && levelFromUrl >= 1 && levelFromUrl <= 10) { // Assuming 10 levels
  loadLevel(levelFromUrl);
} else {
  loadLevel(1); // Default to level 1
}

// Add event listener for mouse leaving the maze container (border)
maze.addEventListener("mouseout", (event) => {
  // Check if mouse leaves the maze container
  const mazeRect = maze.getBoundingClientRect();
  if (
    event.clientX < mazeRect.left ||
    event.clientX > mazeRect.right ||
    event.clientY < mazeRect.top ||
    event.clientY > mazeRect.bottom
  ) {
    showCustomAlert("Game Over! You left the maze area.");
  }
});

// Function to detect a right-click and display the custom alert
document.addEventListener('contextmenu', function(event) {
  event.preventDefault(); // Prevent the default right-click menu
  const rightClickAlert = document.getElementById('right-click-alert');
  if (rightClickAlert) {
    rightClickAlert.style.display = 'flex'; // Show the custom alert
  }
});

// Handling the right-click alert buttons
const rightClickRestart = document.getElementById('right-click-restart');
const rightClickMainMenu = document.getElementById('right-click-mainmenu');

if (rightClickRestart) {
  rightClickRestart.addEventListener('click', () => {
    const rightClickAlert = document.getElementById('right-click-alert');
    rightClickAlert.style.display = 'none'; // Hide the custom alert
    loadLevel(currentLevelNumber); // Restart the current level
  });
}

if (rightClickMainMenu) {
  rightClickMainMenu.addEventListener('click', returnToMainMenu);
}
