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
let currentWin = 0;
let multiplier = 1.1;
let gameActive = false; // игра активна после снятия ставки
let stakeTaken = false; // ставка уже снята

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

    if (!gameActive && !stakeTaken) {
        if (bet > balance) {
            alert("⚠️ Недостаточно баланса для ставки!");
            return;
        }
        subtractBalance(bet); // снимаем ставку один раз при начале игры
        stakeTaken = true;
        gameActive = true;
        renderBalance();
    }

    if (!gameActive) return;
    if (revealed.has(id)) return;

    if (minePositions.has(id)) {
        e.target.textContent = "💣";
        e.target.style.background = "red";
        revealAll(true); // показать все мины красным
        alert("💥 БУМ! Проигрыш!");
        gameActive = false;
    } else {
        e.target.textContent = "✔️";
        e.target.style.background = "green";
        revealed.add(id);
        currentWin += bet * multiplier;
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
        renderBalance();
        gameActive = false;
    }
});

// Запуск
renderBalance();
createField();