function navigate(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen => screen.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");

  if (screenId === "game") {
    initGame();
  }
}
// Array of users
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
    navigate('config');
    return;
  }

  const found = users.find(user => user.username === username && user.password === password);
  if (found) {
    alert('Login successful!');
    navigate('config'); // we'll add this screen later
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
// ABOUT MODAL Logic
const aboutModal = document.getElementById('aboutModal');
const aboutButton = document.querySelector('button[onclick="navigate(\'about\')"]');
const closeAbout = document.getElementById('closeAbout');

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
let gameSettings = {};

function startGame(event) {
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

  player = {
    x: Math.random() * (canvas.width - 50),
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


  document.addEventListener("keydown", e => keysPressed[e.key] = true);
  document.addEventListener("keyup", e => keysPressed[e.key] = false);

  gameInterval = setInterval(gameLoop, 1000 / 60);
  setInterval(increaseEnemySpeed, 5000);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (keysPressed["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keysPressed["ArrowRight"] && player.x + player.width < canvas.width) player.x += player.speed;
  if (keysPressed["ArrowUp"] && player.y > canvas.height * 0.6) player.y -= player.speed;
  if (keysPressed["ArrowDown"] && player.y + player.height < canvas.height) player.y += player.speed;

  drawPlayer();
  moveEnemies();
  drawEnemies();
}

function drawPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawEnemies() {
  for (let enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

function moveEnemies() {
  const rightMost = Math.max(...enemies.map(e => e.x + e.width));
  const leftMost = Math.min(...enemies.map(e => e.x));

  if (rightMost >= canvas.width || leftMost <= 0) {
    moveEnemiesDir *= -1;
    for (let e of enemies) {
      e.y += 10; // ירידה שורתית
    }
  }

  for (let e of enemies) {
    e.x += moveEnemiesDir * enemySpeed;
  }
}

function increaseEnemySpeed() {
  if (enemySpeedIncreaseCount < 4) {
    enemySpeed += 0.5;
    enemySpeedIncreaseCount++;
  }
}





