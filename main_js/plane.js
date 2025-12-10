import { getBalance, addBalance } from "../main_js/balance.js";

const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("betInput");
const betBtn = document.getElementById("betBtn");
const cashoutBtn = document.getElementById("cashoutBtn");

const plane = document.getElementById("plane");
const planeField = document.getElementById("planeField");
const progressBar = document.getElementById("progressBar");
const explosion = document.getElementById("explosion");
const multiplierEl = document.getElementById("multiplier");
const messageEl = document.getElementById("message");

let currentBet = 0;
let multiplier = 1;
let interval = null;
let planePosition = 0;
let gameActive = false;

function renderBalance() {
  balanceEl.textContent = getBalance().toFixed(2);
}
renderBalance();

betBtn.onclick = () => {
  const bet = Number(betInput.value);
  if (bet <=0 || isNaN(bet)) {
    messageEl.textContent = "❌ Некорректная ставка";
    return;
  }
  if (bet > getBalance()) {
    messageEl.textContent = "❌ Недостаточно баланса";
    return;
  }

  currentBet = bet;
  addBalance(-bet);
  renderBalance();

  messageEl.textContent = "🛫 Самолёт взлетел!";
  multiplier = 1;
  planePosition = 0;
  plane.style.left = '0px';
  multiplierEl.textContent = "Множитель: x1.00";
  progressBar.style.width = '0';
  explosion.style.display = 'none';

  gameActive = true;
  cashoutBtn.disabled = false;
  betBtn.disabled = true;
  betInput.disabled = true;

  startPlane();
};

cashoutBtn.onclick = () => {
  if (!gameActive) return;

  const winAmount = (currentBet * multiplier).toFixed(2);
  addBalance(Number(winAmount));
  renderBalance();
  messageEl.textContent = `✅ Вы забрали ${winAmount} грн!`;
  stopGame();
};

function startPlane() {
  const fieldWidth = planeField.clientWidth - 30;

  interval = setInterval(() => {
    if (!gameActive) return;

    planePosition += 4; 
    plane.style.left = planePosition + 'px';

    // рост множителя
    multiplier += 0.02;
    multiplierEl.textContent = "Множитель: x" + multiplier.toFixed(2);
    multiplierEl.style.transform = `scale(${1 + multiplier/20})`;

    // прогресс-бар
    const progressPercent = Math.min((planePosition / fieldWidth) * 100, 100);
    progressBar.style.width = progressPercent + '%';

    // шанс взрыва
    const crashChance = 0.01;
    if (Math.random() < crashChance || planePosition >= fieldWidth) {
      explosion.style.left = planePosition + 'px';
      explosion.style.display = 'block';
      plane.style.display = 'none';
      messageEl.textContent = `💥 Самолёт улетел! Ты потерял ${currentBet} грн`;
      stopGame();
    }
  }, 100);
}

function stopGame() {
  clearInterval(interval);
  gameActive = false;
  betBtn.disabled = false;
  betInput.disabled = false;
  cashoutBtn.disabled = true;
  multiplier = 1;
  currentBet = 0;
  planePosition = 0;
  plane.style.left = '0px';
  plane.style.display = 'block';
  explosion.style.display = 'none';
  progressBar.style.width = '0';
  multiplierEl.textContent = "Множитель: x1.00";
  multiplierEl.style.transform = 'scale(1)';
}