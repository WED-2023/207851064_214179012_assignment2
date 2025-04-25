let playerBullet = null;
let enemyBulletSpeed = 4;
let enemyBullets = [];
let canShoot = true;
let lastEnemyShotTime = 0;
let timeLeft; 
let gameTimerInterval;
function navigate(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen => screen.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");

  if (screenId === "game") {
    initGame();
  }
}

let users = [
  { username: 'p', password: 'testuser', email: 'default@user.com' }
];

function handleRegister(event) {
  event.preventDefault();

  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;
  const firstName = document.getElementById('regFirstName').value;
  const lastName = document.getElementById('regLastName').value;
  const email = document.getElementById('regEmail').value;

  const error = document.getElementById('registerError');
  error.textContent = '';

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  const nameRegex = /^[A-Za-z]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!passwordRegex.test(password)) {
    error.textContent = 'Password must be at least 8 characters and include letters and numbers.';
    return false;
  }

  if (password !== confirmPassword) {
    error.textContent = 'Passwords do not match.';
    return false;
  }

  if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
    error.textContent = 'First and last names must contain only letters.';
    return false;
  }

  if (!emailRegex.test(email)) {
    error.textContent = 'Invalid email address.';
    return false;
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    error.textContent = 'Username already exists.';
    return false;
  }

  const emailInUse = users.some(user => user.email === email);
  if (emailInUse) {
    error.textContent = 'This email is already registered.';
    return false;
  }

  const passwordInUse = users.some(user => user.password === password);
  if (passwordInUse) {
    error.textContent = 'This password is already in use. Please choose a different one.';
    return false;
  }
  users.push({ username, password, email });
  alert('Registration successful!');
    localStorage.setItem("currentUser", username);
  navigate('login');
  return false;
}


function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const error = document.getElementById('loginError');
  error.textContent = '';

    if (username === 'p' && password === 'testuser') {
    alert('Login successful as test user!');
    localStorage.setItem("currentUser", username);
    resetGameState();
    navigate('config');
    return;
  }

  const found = users.find(user => user.username === username && user.password === password);
  if (found) {
    alert('Login successful!');
    resetGameState();
    navigate('config');
    localStorage.setItem("currentUser", username);
  } else {
    error.textContent = 'Invalid username or password.';
  }
}
window.onload = () => {
  // Create options for date dropdowns
  const yearSelect = document.getElementById('regYear');
  const monthSelect = document.getElementById('regMonth');
  const daySelect = document.getElementById('regDay');

  for (let y = 2024; y >= 1900; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.text = y;
    yearSelect.appendChild(opt);
  }

  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.text = m;
    monthSelect.appendChild(opt);
  }

  for (let d = 1; d <= 31; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.text = d;
    daySelect.appendChild(opt);
  }
  // Populate shoot key dropdown (A-Z + space)
const shootKeySelect = document.getElementById('shootKey');
for (let i = 65; i <= 90; i++) {
  const letter = String.fromCharCode(i);
  const opt = document.createElement('option');
  opt.value = letter;
  opt.text = letter;
  shootKeySelect.appendChild(opt);
}
};
const aboutModal = document.getElementById('aboutModal');
const aboutButton = document.getElementById('aboutBtn'); 
const closeAbout = document.getElementById('closeAbout');


if (aboutButton && aboutModal && closeAbout) {
  // Open modal when clicking "About"
  aboutButton.addEventListener('click', () => {
    aboutModal.style.display = 'block';
  });

  // Close modal on X
  closeAbout.addEventListener('click', () => {
    aboutModal.style.display = 'none';
  });

  // Close modal when clicking outside content
  window.addEventListener('click', (event) => {
    if (event.target === aboutModal) {
      aboutModal.style.display = 'none';
    }
  });

  // Close modal on ESC key
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      aboutModal.style.display = 'none';
    }
  });
}

let gameSettings = {};
const backgroundMusic = document.getElementById('backgroundMusic');

function startGame(event) {
  backgroundMusic.play();
  event.preventDefault();
  const shootKey = document.getElementById('shootKey').value;
  const gameTime = parseInt(document.getElementById('gameTime').value);
  const playerColor = document.getElementById('playerColor').value;
  const enemyColor = document.getElementById('enemyColor').value;

  if (gameTime < 2) {
    alert("Game time must be at least 2 minutes.");
    return false;
  }

  gameSettings = {
    shootKey,
    gameTime,
    playerColor,
    enemyColor
  };

  console.log("Game Settings:", gameSettings);
  navigate('game'); // go to game screen
  return false;
}
let canvas, ctx;
let player, enemies = [];
let keysPressed = {};
let gameInterval, moveEnemiesDir = 1;
let enemySpeed = 1;
let enemySpeedIncreaseCount = 0;

function initGame() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  timeLeft = gameSettings.gameTime * 60;

  gameTimerInterval = setInterval(() => {
  timeLeft--;
  if (timeLeft <= 0) {
    endGame("time");
  }
}, 1000);


  player = {
    x: 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    color: gameSettings.playerColor || "#00ffcc",
    speed: 5
  };
  enemies = [];
  const rows = 4;
  const cols = 5;
  const spacing = 80;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      enemies.push({
        x: 100 + c * spacing,
        y: 50 + r * 50,
        width: 40,
        height: 30,
        row: r,
        color: gameSettings.enemyColor || "#ff3366"
      });
    }
  }


  document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;

  if (e.key === gameSettings.shootKey && canShoot && !playerBullet) {
    shootPlayerBullet();
  }
});

  document.addEventListener("keyup", e => keysPressed[e.key] = false);

  gameInterval = setInterval(gameLoop, 1000 / 60);
  setInterval(increaseEnemySpeed, 5000);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  let timeDisplay = `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;
  //ctx.fillText("Time Left: " + timeDisplay, 20, 60);


  if (keysPressed["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keysPressed["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;
  if (keysPressed["ArrowUp"] && player.y > canvas.height * 0.6) player.y -= player.speed;
  if (keysPressed["ArrowDown"] && player.y + player.height < canvas.height) player.y += player.speed;

  drawPlayer();
  moveEnemies();
  drawEnemies();
  handleEnemyShooting();
  updateBullets();
  checkCollisions();
  drawBullets();
  ctx.fillStyle = "#fff";
  ctx.font = "18px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Score: " + score + " | Lives: " + lives + " | Time: " + timeDisplay, canvas.width / 2, 30);
  if (enemies.length === 0) {
  endGame("win");
}




}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemies() {
  for (let enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);

    let points = (3 - enemy.row) * 5 + 5;
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(points, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + 5);
  }
}

function moveEnemies() {
  const rightMost = Math.max(...enemies.map(e => e.x + e.width));
  const leftMost = Math.min(...enemies.map(e => e.x));

  if (rightMost >= canvas.width || leftMost <= 0) {
    moveEnemiesDir *= -1;
    for (let e of enemies) {
      e.y += 10; 
    }
  }

  for (let e of enemies) {
    e.x += moveEnemiesDir * enemySpeed;
  }
}

function increaseEnemySpeed() {
  if (enemySpeedIncreaseCount < 4) {
    enemySpeed += 0.5;
    enemyBulletSpeed += 0.5;
    enemySpeedIncreaseCount++;
  }
}
function shootPlayerBullet() {
  playerBullet = {
    x: player.x + player.width / 2 - 3,
    y: player.y,
    width: 6,
    height: 12,
    color: "#0f0",
    speed: 7
  };
}
function handleEnemyShooting() {
  const now = Date.now();

  if (enemyBullets.length === 0 || (enemyBullets.length > 0 && enemyBullets[0].y > canvas.height * 0.75)) {
    if (now - lastEnemyShotTime > 1000) {
      const shooters = enemies.filter(e => e); 
      if (shooters.length > 0) {
        const shooter = shooters[Math.floor(Math.random() * shooters.length)];
        enemyBullets.push({
          x: shooter.x + shooter.width / 2 - 3,
          y: shooter.y + shooter.height,
          width: 6,
          height: 12,
          color: "#f00",
          speed: enemyBulletSpeed
        });
        lastEnemyShotTime = now;
      }
    }
  }
}
function updateBullets() {
  if (playerBullet) {
    playerBullet.y -= playerBullet.speed;
    if (playerBullet.y < 0) {
      playerBullet = null;
    }
  }

  enemyBullets = enemyBullets.filter(bullet => bullet.y < canvas.height);
  for (let b of enemyBullets) {
    b.y += b.speed;
  }
}

function drawBullets() {
  if (playerBullet) {
    ctx.fillStyle = playerBullet.color;
    ctx.fillRect(playerBullet.x, playerBullet.y, playerBullet.width, playerBullet.height);
  }

  for (let b of enemyBullets) {
    ctx.fillStyle = b.color;
    ctx.fillRect(b.x, b.y, b.width, b.height);
  }
}
let score = 0;
let lives = 3;

function checkCollisions() {
  if (playerBullet) {
    for (let i = 0; i < enemies.length; i++) {
      let e = enemies[i];
      if (
        playerBullet.x < e.x + e.width &&
        playerBullet.x + playerBullet.width > e.x &&
        playerBullet.y < e.y + e.height &&
        playerBullet.y + playerBullet.height > e.y
      ) {

        score += (4 - e.row) * 5; 
        enemies.splice(i, 1);
        playerBullet = null;
        SOUNDS.hitSound.play();
        break;
      }
    }
  }

  for (let i = 0; i < enemyBullets.length; i++) {
    let b = enemyBullets[i];
    if (
      b.x < player.x + player.width &&
      b.x + b.width > player.x &&
      b.y < player.y + player.height &&
      b.y + b.height > player.y
    ) {
      
      lives--;
      enemyBullets.splice(i, 1);
      SOUNDS.explosionSound.play();
      resetPlayerPosition();
      break;
    }
  }
  if (lives <= 0) {
  endGame("death");
}

}

function resetPlayerPosition() {
  player.x = 20;
  player.y = canvas.height - 60;
}


function endGame(reason) {
  clearInterval(gameInterval);
  clearInterval(gameTimerInterval);
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;

  let message = "";
  if (reason === "death") {
    message = "You Lost!";
  } else if (reason === "time") {
    if (score < 100) {
      message = `You can do better... Your score: ${score}`;
    } else {
      message = `Winner! Your score: ${score}`;
    }
  } else if (reason === "win") {
    message = "Champion!";
  }
  alert(message);
  saveScore(score);
  showScoreBoard();
  navigate("score");
}
function saveScore(currentScore) {
  const currentUser = getCurrentUsername(); 
  if (!currentUser) return;

  const scores = JSON.parse(localStorage.getItem(currentUser)) || [];
  scores.push(currentScore);
  localStorage.setItem(currentUser, JSON.stringify(scores));
}
function showScoreBoard() {
  const currentUser = getCurrentUsername();
  const scoreListDiv = document.getElementById("scoreList");
  scoreListDiv.innerHTML = "";

  if (!currentUser) {
    scoreListDiv.innerHTML = "<p>No user logged in.</p>";
    return;
  }

  const scores = JSON.parse(localStorage.getItem(currentUser)) || [];
  scores.sort((a, b) => b - a);

  let html = `
    <h3 style="color: #00ffcc; font-size: 24px;">🏆 Your High Scores 🏆</h3>
    <table style="margin: 0 auto; border-collapse: collapse; color: white; width: 60%; font-size: 18px; border: 1px solid #555;">
      <thead>
        <tr style="background-color: #333;">
          <th style="padding: 10px;">Rank</th>
          <th style="padding: 10px;">Score</th>
        </tr>
      </thead>
      <tbody>
  `;

  scores.forEach((score, index) => {
    let rank = index + 1;
    let medal = "";
    if (rank === 1) medal = "🥇";
    else if (rank === 2) medal = "🥈";
    else if (rank === 3) medal = "🥉";

    html += `
      <tr style="background-color: ${index % 2 === 0 ? '#222' : '#111'};">
        <td style="padding: 10px; text-align: center;">${medal || rank}</td>
        <td style="padding: 10px; text-align: center;">${score}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  scoreListDiv.innerHTML = html;
}

function getCurrentUsername() {
  return localStorage.getItem("currentUser");
}
function startNewGame() {
  resetGameState();
  navigate("config");
}
function resetGameState() {
  clearInterval(gameInterval);
  clearInterval(gameTimerInterval);

  player = null;
  enemies = [];
  playerBullet = null;
  enemyBullets = [];
  canShoot = true;
  score = 0;
  lives = 3;
  timeLeft = 0;
  enemySpeed = 1;
  enemySpeedIncreaseCount = 0;
  enemyBulletSpeed = 4;
  keysPressed = {};

  if (backgroundMusic) {
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
  }
  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
function resetScores() {
  const currentUser = getCurrentUsername(); 
  if (!currentUser) {
    alert("No user logged in.");
    return;
  }

  const confirmReset = confirm("Are you sure you want to reset your scores?");
  if (confirmReset) {
    localStorage.setItem(currentUser, JSON.stringify([]));
    showScoreBoard(); 
    alert("Your scores were reset.");
  }
}
