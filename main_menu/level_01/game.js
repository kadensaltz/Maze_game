// Reusable function to redirect to the main menu
function returnToMainMenu() {
  window.location.href = "https://kadensaltz.github.io/Maze_game/main_menu/index.html";
}

// Detect collision with walls
const maze = document.getElementById("maze");
const walls = document.querySelectorAll(".wall");

// Event listener for mouse over walls
walls.forEach(wall => {
  wall.addEventListener("mouseenter", () => {
    showCustomAlert("Game Over! You touched a wall.");
  });
});

// Detect reaching the end
const end = document.querySelector(".end");
end.addEventListener("mouseenter", () => {
  showCompletedAlert();  // Show the "completed maze" alert when the player reaches the end
});

// Function to randomly place the start and end elements
function placeStartAndEnd() {
  const start = document.querySelector(".start");
  const end = document.querySelector(".end");

  const mazeRect = maze.getBoundingClientRect();
  const mazeWidth = mazeRect.width;
  const mazeHeight = mazeRect.height;

  const startX = Math.random() * (mazeWidth - start.offsetWidth);
  const startY = Math.random() * (mazeHeight - start.offsetHeight);
  const endX = Math.random() * (mazeWidth - end.offsetWidth);
  const endY = Math.random() * (mazeHeight - end.offsetHeight);

  start.style.position = "absolute";
  start.style.left = `${startX}px`;
  start.style.top = `${startY}px`;

  end.style.position = "absolute";
  end.style.left = `${endX}px`;
  end.style.top = `${endY}px`;
}

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
  startTime = Date.now(); // Reset the start time when the level is restarted
  resumeTimer(); // Start/resume the timer
  placeStartAndEnd(); // Reset the maze
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
  startTime = Date.now(); // Reset the start time when the level is restarted
  resumeTimer(); // Start/resume the timer
  placeStartAndEnd(); // Reset the maze
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

// nextLevelButton.addEventListener("click", () => {
//   window.location.href = "game2.html"; // Redirect to next level (game2.html)
// });

alertMainMenuComplete.addEventListener("click", returnToMainMenu);

// Start the timer
updateTimer();

// Call the function to place the start and end elements
placeStartAndEnd();

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
    loadLevel(currentLevelIndex); // Restart the current level
  });
}

if (rightClickMainMenu) {
  rightClickMainMenu.addEventListener('click', returnToMainMenu);
}