// Select the Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Game Variables
let gameOver = false;
let score = 0;

// Paraglider Properties
const paraglider = {
    x: WIDTH / 2 - 20, // Starting X position
    y: HEIGHT / 4,      // Starting Y position
    width: 40,
    height: 40,
    speedX: 5,
    speedY: 0,
    gravity: 0.05,
    lift: -5,
    color: '#FF0000', // Red color for paraglider
};

// Obstacles and Thermals
const mountains = [];
const clouds = [];
const cables = [];
const thermals = [];

// Populate initial obstacles
for (let i = 0; i < 3; i++) {
    createMountain();
    createCloud();
    createCable();
    createThermal();
}

// Keyboard Controls
const keys = {
    left: false,
    right: false,
};

// Event Listeners for Key Presses
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowRight') keys.right = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.left = false;
    if (e.code === 'ArrowRight') keys.right = false;
});

// Functions to Create Obstacles and Thermals
function createMountain() {
    const x = Math.random() * (WIDTH - 100);
    const y = HEIGHT - 50 - Math.random() * 100;
    const width = 100 + Math.random() * 100;
    const height = 50 + Math.random() * 100;
    mountains.push({ x, y, width, height });
}

function createCloud() {
    const x = Math.random() * (WIDTH - 100);
    const y = Math.random() * (HEIGHT / 2);
    const width = 100;
    const height = 60;
    clouds.push({ x, y, width, height });
}

function createCable() {
    const x = Math.random() * (WIDTH - 10);
    const y = Math.random() * (HEIGHT - 300) + 100;
    const width = 10;
    const height = 200;
    cables.push({ x, y, width, height });
}

function createThermal() {
    const x = Math.random() * (WIDTH - 50);
    const y = Math.random() * (HEIGHT - 200) + 100;
    const width = 50;
    const height = 10;
    thermals.push({ x, y, width, height });
}

// Collision Detection Function
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Main Game Loop
function gameLoop() {
    if (!gameOver) {
        update();
        render();
        requestAnimationFrame(gameLoop);
    } else {
        renderGameOver();
    }
}

// Update Game State
function update() {
    // Handle Keyboard Input
    if (keys.left && paraglider.x > 0) {
        paraglider.x -= paraglider.speedX;
    }
    if (keys.right && paraglider.x + paraglider.width < WIDTH) {
        paraglider.x += paraglider.speedX;
    }

    // Apply Gravity
    paraglider.speedY += paraglider.gravity;
    paraglider.y += paraglider.speedY;

    // Check for Thermals
    const paragliderRect = {
        x: paraglider.x,
        y: paraglider.y,
        width: paraglider.width,
        height: paraglider.height,
    };

    thermals.forEach((thermal, index) => {
        const thermalRect = {
            x: thermal.x,
            y: thermal.y,
            width: thermal.width,
            height: thermal.height,
        };

        if (isColliding(paragliderRect, thermalRect)) {
            paraglider.speedY = paraglider.lift;
            thermals.splice(index, 1); // Remove the thermal once used
            createThermal(); // Create a new thermal
            score += 10; // Increase score for finding a thermal
        }
    });

    // Check for Collisions with Obstacles
    mountains.forEach((mountain) => {
        const mountainRect = {
            x: mountain.x,
            y: mountain.y,
            width: mountain.width,
            height: mountain.height,
        };

        if (isColliding(paragliderRect, mountainRect)) {
            gameOver = true;
        }
    });

    cables.forEach((cable) => {
        const cableRect = {
            x: cable.x,
            y: cable.y,
            width: cable.width,
            height: cable.height,
        };

        if (isColliding(paragliderRect, cableRect)) {
            gameOver = true;
        }
    });

    clouds.forEach((cloud, index) => {
        const cloudRect = {
            x: cloud.x,
            y: cloud.y,
            width: cloud.width,
            height: cloud.height,
        };

        if (isColliding(paragliderRect, cloudRect)) {
            paraglider.speedY += paraglider.gravity * 2; // Simulate rain increasing descent
        }
    });

    // Check if Landed Safely
    if (paraglider.y + paraglider.height >= HEIGHT - 50) {
        gameOver = true;
    }

    // Scroll Obstacles and Thermals Upwards to Simulate Movement
    mountains.forEach((mountain, index) => {
        mountain.y += paraglider.speedY;
        if (mountain.y > HEIGHT) {
            mountains.splice(index, 1);
            createMountain();
        }
    });

    cables.forEach((cable, index) => {
        cable.y += paraglider.speedY;
        if (cable.y > HEIGHT) {
            cables.splice(index, 1);
            createCable();
        }
    });

    clouds.forEach((cloud, index) => {
        cloud.y += paraglider.speedY;
        if (cloud.y > HEIGHT) {
            clouds.splice(index, 1);
            createCloud();
        }
    });

    thermals.forEach((thermal, index) => {
        thermal.y += paraglider.speedY;
        if (thermal.y > HEIGHT) {
            thermals.splice(index, 1);
            createThermal();
        }
    });

    // Increment Score Over Time
    score += 1;
}

// Render Game Elements
function render() {
    // Clear the Canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw Ground
    ctx.fillStyle = '#228B22'; // Forest Green
    ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);

    // Draw Paraglider
    ctx.fillStyle = paraglider.color;
    ctx.fillRect(paraglider.x, paraglider.y, paraglider.width, paraglider.height);

    // Optionally, Draw a Simple Pilot (Circle)
    ctx.fillStyle = '#FFD700'; // Gold color for pilot
    ctx.beginPath();
    ctx.arc(paraglider.x + paraglider.width / 2, paraglider.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw Mountains
    ctx.fillStyle = '#8B4513'; // Saddle Brown
    mountains.forEach((mountain) => {
        ctx.fillRect(mountain.x, mountain.y, mountain.width, mountain.height);
    });

    // Draw Cables
    ctx.fillStyle = '#000000'; // Black
    cables.forEach((cable) => {
        ctx.fillRect(cable.x, cable.y, cable.width, cable.height);
    });

    // Draw Clouds
    ctx.fillStyle = '#D3D3D3'; // Light Gray
    clouds.forEach((cloud) => {
        ctx.beginPath();
        ctx.ellipse(cloud.x, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Thermals
    ctx.fillStyle = '#FF8C00'; // Dark Orange
    thermals.forEach((thermal) => {
        ctx.fillRect(thermal.x, thermal.y, thermal.width, thermal.height);
    });

    // Draw Score
    ctx.fillStyle = '#000000'; // Black
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

// Render Game Over Screen
function renderGameOver() {
    // Clear the Canvas
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Draw Ground
    ctx.fillStyle = '#228B22'; // Forest Green
    ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);

    // Draw Game Over Text
    ctx.fillStyle = '#FF0000'; // Red
    ctx.font = '50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', WIDTH / 2, HEIGHT / 2 - 50);

    // Draw Final Score
    ctx.fillStyle = '#000000'; // Black
    ctx.font = '30px Arial';
    ctx.fillText(`Final Score: ${score}`, WIDTH / 2, HEIGHT / 2);

    // Optionally, Prompt to Restart
    ctx.font = '20px Arial';
    ctx.fillText('Refresh the page to play again.', WIDTH / 2, HEIGHT / 2 + 50);
}

// Start the Game Loop
gameLoop();
