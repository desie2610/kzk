import { getBalance, addBalance, subtractBalance } from './balance.js';

const field = document.getElementById("field");
const modeButtons = document.querySelectorAll(".mode");
const stopBtn = document.getElementById("stopBtn");
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("bet");

let potentialEl = document.createElement("div");
potentialEl.style.margin = "10px";
potentialEl.style.fontSize = "1.4rem";
document.body.insertBefore(potentialEl, field);

let mines = 3;
let cells = [];
let minePositions = new Set();
let revealed = new Set();
let revealedCount = 0;
let currentWin = 0;
let multiplier = 1.1;
let gameActive = false;
let stakeTaken = false;

// Обновляем баланс на экране
function renderBalance() {
    balanceEl.textContent = getBalance().toFixed(2);
    updatePotential();
}

// Потенциальный вывод
function updatePotential() {
    potentialEl.textContent = `💰 Потенциальный вывод: ${currentWin.toFixed(2)} грн`;
}

// Создаём поле 5x5
function createField() {
    field.innerHTML = "";
    cells = [];
    minePositions.clear();
    revealed.clear();
    revealedCount = 0;
    currentWin = 0;
    gameActive = false;
    stakeTaken = false;

    multiplier = mines === 3 ? 1.1 : mines === 5 ? 1.5 : 2.5;

    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * 25));
    }

    for (let i = 0; i < 25; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.id = i;
        cell.addEventListener("click", onCellClick);
        cells.push(cell);
        field.appendChild(cell);
    }

    updatePotential();
}

// Обработка клика по клетке
function onCellClick(e) {
    const id = Number(e.target.dataset.id);
    const bet = Number(betInput.value);
    const balance = getBalance();

    // Снятие ставки один раз при начале игры
    if (!gameActive && !stakeTaken) {
        if (bet > balance) {
            alert("⚠️ Недостаточно баланса для ставки!");
            return;
        }
        subtractBalance(bet);
        stakeTaken = true;
        gameActive = true;
        renderBalance();
    }

    if (!gameActive) return;
    if (revealed.has(id)) return;

    if (minePositions.has(id)) {
        e.target.textContent = "💣";
        e.target.style.background = "red";
        revealAll(true);
        alert("💥 БУМ! Проигрыш!");
        gameActive = false;
        revealedCount = 0;
        currentWin = 0;
        updatePotential();
    } else {
        e.target.textContent = "✔️";
        e.target.style.background = "green";
        revealed.add(id);
        revealedCount++;
        // Правильная система х
        currentWin = bet * (1 + revealedCount * (multiplier - 1));
        updatePotential();
    }
}

// Показать все мины
function revealAll(showFull=false) {
    cells.forEach((cell, i) => {
        if (minePositions.has(i)) {
            cell.textContent = "💣";
            cell.style.background = showFull ? "red" : "rgba(255,0,0,0.2)";
        }
    });
}

// Выбор режима
modeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        mines = Number(btn.dataset.mines);
        createField();
    });
});

// Остановиться и забрать выигрыш
stopBtn.addEventListener("click", () => {
    if (!gameActive) return;
    if (currentWin > 0) {
        addBalance(currentWin);
        alert(`Ты остановился и забрал ${currentWin.toFixed(2)} грн!`);
        revealAll(false);
        currentWin = 0;
        revealedCount = 0;
        renderBalance();
        gameActive = false;
    }
});

// Модальное окно
const rulesModal = document.getElementById("rulesModal");
const closeRulesBtn = document.getElementById("closeRules");
const showRulesBtn = document.getElementById("showRulesBtn");

// Закрытие модалки
closeRulesBtn.addEventListener("click", () => {
    rulesModal.style.display = "none";
});

// Открытие правил по кнопке снизу справа
showRulesBtn.addEventListener("click", () => {
    rulesModal.style.display = "flex";
});
// Запуск
renderBalance();
createField();
