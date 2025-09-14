const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10, PADDLE_HEIGHT = 100, BALL_SIZE = 14;
const PLAYER_X = 10, AI_X = canvas.width - PADDLE_WIDTH - 10;
const PADDLE_SPEED = 6;

// Game state
let playerY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiY = (canvas.height - PADDLE_HEIGHT) / 2;
let ball = {
    x: canvas.width / 2 - BALL_SIZE / 2,
    y: canvas.height / 2 - BALL_SIZE / 2,
    vx: Math.random() < 0.5 ? 5 : -5,
    vy: (Math.random() - 0.5) * 6
};
let playerScore = 0, aiScore = 0;

// Mouse control
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    let mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    // Clamp within canvas
    playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, playerY));
});

// Draw functions
function drawRect(x, y, w, h, color = "#fff") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color = "#fff") {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function drawNet() {
    for (let y = 0; y < canvas.height; y += 30) {
        drawRect(canvas.width / 2 - 2, y, 4, 20, "#555");
    }
}

function drawScore() {
    ctx.font = "32px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText(playerScore, canvas.width / 2 - 60, 50);
    ctx.fillText(aiScore, canvas.width / 2 + 30, 50);
}

// Collision
function collide(paddleX, paddleY) {
    // Ball and paddle collision
    return (
        ball.x < paddleX + PADDLE_WIDTH &&
        ball.x + BALL_SIZE > paddleX &&
        ball.y < paddleY + PADDLE_HEIGHT &&
        ball.y + BALL_SIZE > paddleY
    );
}

// Update functions
function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Top and bottom collision
    if (ball.y <= 0) {
        ball.y = 0;
        ball.vy *= -1;
    } else if (ball.y + BALL_SIZE >= canvas.height) {
        ball.y = canvas.height - BALL_SIZE;
        ball.vy *= -1;
    }

    // Left paddle collision
    if (collide(PLAYER_X, playerY)) {
        ball.x = PLAYER_X + PADDLE_WIDTH;
        ball.vx *= -1.05; // speed up
        // angle based on where it hit the paddle
        let relIntersectY = (ball.y + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        ball.vy = relIntersectY * 0.25;
    }

    // Right paddle (AI) collision
    if (collide(AI_X, aiY)) {
        ball.x = AI_X - BALL_SIZE;
        ball.vx *= -1.05;
        let relIntersectY = (ball.y + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        ball.vy = relIntersectY * 0.25;
    }

    // Score
    if (ball.x < 0) {
        aiScore++;
        resetBall();
    } else if (ball.x + BALL_SIZE > canvas.width) {
        playerScore++;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2 - BALL_SIZE / 2;
    ball.y = canvas.height / 2 - BALL_SIZE / 2;
    ball.vx = Math.random() < 0.5 ? 5 : -5;
    ball.vy = (Math.random() - 0.5) * 6;
}

// AI movement
function updateAI() {
    // Move AI paddle toward ball, but limit speed
    let target = ball.y + BALL_SIZE / 2 - PADDLE_HEIGHT / 2;
    if (aiY < target) {
        aiY += Math.min(PADDLE_SPEED, target - aiY);
    } else {
        aiY -= Math.min(PADDLE_SPEED, aiY - target);
    }
    // Clamp within canvas
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
}

// Game loop
function gameLoop() {
    // Update
    updateBall();
    updateAI();

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawScore();
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    drawCircle(ball.x + BALL_SIZE / 2, ball.y + BALL_SIZE / 2, BALL_SIZE / 2);

    requestAnimationFrame(gameLoop);
}

gameLoop();