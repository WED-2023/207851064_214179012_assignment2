function navigate(screenId) {
  const screens = document.querySelectorAll(".screen");
  screens.forEach(screen => screen.classList.remove("active"));
  document.getElementById(screenId).classList.add("active");
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
};


