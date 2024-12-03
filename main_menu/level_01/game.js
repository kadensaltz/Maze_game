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

// Call the function to place the start and end elements
placeStartAndEnd();