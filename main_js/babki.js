import { getBalance, addBalance } from './balance.js';

const balanceEl = document.getElementById("balance");
const workBtn = document.getElementById("workBtn");

// Обновление баланса на экране
function renderBalance() {
    const balance = getBalance();
    balanceEl.textContent = balance.toFixed(2);
}

// Нажатие кнопки “Получить зарплату”
workBtn.addEventListener("click", () => {
    const earned = 25; // фиксированная зарплата
    addBalance(earned);
    renderBalance();
});

// Стартовое отображение
renderBalance();