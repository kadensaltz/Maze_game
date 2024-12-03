// Detect collision with walls
const maze = document.getElementById("maze");
const walls = document.querySelectorAll(".wall");

// Event listener for mouse over walls
walls.forEach(wall => {
  wall.addEventListener("mouseenter", () => {
    alert("Game Over! You touched a wall.");
    // Optional: Reset game or reload page
  });
});

// Detect reaching the end
const end = document.querySelector(".end");
end.addEventListener("mouseenter", () => {
  alert("Congratulations! You've completed the maze.");
  // Optional: Reset game or proceed to next level
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
let startTime = Date.now();
const timerElement = document.getElementById("timer");

function updateTimer() {
  const elapsed = (Date.now() - startTime) / 1000; // Time in seconds
  timerElement.textContent = `Time: ${elapsed.toFixed(2)}s`;
  requestAnimationFrame(updateTimer); // Keeps updating the timer
}

// Event listener for Escape key to show confirmation overlay
document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    // Show the overlay
    const overlay = document.getElementById("escape-overlay");
    overlay.style.display = "flex"; // Display the overlay
  }
});

// Handling the confirmation buttons
const confirmBack = document.getElementById("confirm-back");
const cancelBack = document.getElementById("cancel-back");

confirmBack.addEventListener("click", () => {
  window.location.href = "https://kadensaltz.github.io/Maze_game/main_menu/index.html"; // Redirect to main menu
});

cancelBack.addEventListener("click", () => {
  const overlay = document.getElementById("escape-overlay");
  overlay.style.display = "none"; // Close the overlay
});

// Start the timer
updateTimer();

// Call the function to place the start and end elements
placeStartAndEnd();
