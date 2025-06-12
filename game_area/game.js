// Reusable function to redirect to the main menu
function returnToMainMenu() {
  window.location.href = "https://kadensaltz.github.io/Maze_game/main_menu/index.html";
}

let currentLevelNumber = 1;
const maze = document.getElementById("maze"); // Maze container

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
  const completedAlert = document.getElementById("completed-alert");
  completedAlert.style.display = "flex"; // Show the completed alert
  pauseTimer(); // Pause the timer when the alert is shown

  const playerName = prompt("Congratulations! Enter your name for the leaderboard:");
  if (playerName) {
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const time = parseFloat(timerElement.textContent.replace('Time: ', '').replace('s', ''));
    leaderboard.push({ name: playerName, time: time, level: currentLevelNumber });
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
  }
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

// Function to load and render a level
async function loadLevel(levelNumber) {
  currentLevelNumber = levelNumber;
  const levelFile = `levels/level_${String(levelNumber).padStart(2, '0')}.json`;

  try {
    const response = await fetch(levelFile);
    if (!response.ok) {
      throw new Error(`Could not load level ${levelNumber}: ${response.statusText}`);
    }
    const levelData = await response.json();

    // Clear existing maze elements (walls)
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
        // Ensure showCustomAlert is accessible
        showCustomAlert("Game Over! You touched a wall.");
      });
    });

    // Render Start
    let startElement = document.querySelector(".start");
    if (!startElement) { // Should exist from HTML, but as a fallback
        startElement = document.createElement('div');
        startElement.classList.add('start');
        maze.appendChild(startElement);
    }
    startElement.style.position = 'absolute';
    startElement.style.left = levelData.start.x + '%';
    startElement.style.top = levelData.start.y + '%';
    // Ensure 'S' or other content is visible if not using background image
    startElement.textContent = 'S';


    // Render End
    let endElement = document.querySelector(".end");
    if (!endElement) { // Should exist from HTML
        endElement = document.createElement('div');
        endElement.classList.add('end');
        maze.appendChild(endElement);
    }
    endElement.style.position = 'absolute';
    endElement.style.left = levelData.end.x + '%';
    endElement.style.top = levelData.end.y + '%';
    // Ensure 'E' or other content is visible
    endElement.textContent = 'E';

    // Remove old listener before adding a new one to prevent duplicates
    const newEndElement = endElement.cloneNode(true);
    endElement.parentNode.replaceChild(newEndElement, endElement);
    newEndElement.addEventListener("mouseenter", showCompletedAlert);


    // Reset timer
    startTime = Date.now();
    resumeTimer(); // Make sure timer is running

  } catch (error) {
    console.error("Error loading level:", error);
    alert("Failed to load level data. Returning to main menu.");
    returnToMainMenu();
  }
}

// Start the timer
updateTimer();

// Initial Load Logic
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
