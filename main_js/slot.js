import { getBalance, addBalance, subtractBalance } from './balance.js';

const slotsField = document.getElementById("slotsField");
const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("bet");
const spinBtn = document.getElementById("spinBtn");
const potentialEl = document.getElementById("potentialWin");

const rows = 3;
const cols = 4;

// Символы и их шансы выпадения (%)
const symbolsWithChances = [
    { symbol: "🍒", chance: 30 },
    { symbol: "🍌", chance: 25 },
    { symbol: "🍋", chance: 20 },
    { symbol: "💎", chance: 15 },
    { symbol: "7️⃣", chance: 8 },
    { symbol: "🪙", chance: 2 },
];

// Множители за 3+ символа на линии
const multipliers = { "🍒": 1.1, "🍌": 1.2, "🍋": 1.3, "💎": 1.5, "7️⃣": 2, "🪙": 2.5 };

let currentWin = 0;

// Отображение баланса и потенциального выигрыша
function renderBalance() {
    balanceEl.textContent = getBalance().toFixed(2);
    potentialEl.textContent = `💰 Вы выиграли: ${currentWin.toFixed(2)} грн`;
}
renderBalance();

// Создание поля
function createField() {
    slotsField.innerHTML = "";
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        cell.classList.add("slot-cell");
        cell.textContent = "-";
        slotsField.appendChild(cell);
    }
}
createField();

// Получение случайного символа по шансам
function getRandomSymbol() {
    const rand = Math.random() * 100;
    let sum = 0;
    for (let item of symbolsWithChances) {
        sum += item.chance;
        if (rand <= sum) return item.symbol;
    }
    return symbolsWithChances[0].symbol;
}

// Проверка линии на выигрыш (только если 3 и более одинаковых символов)
function checkLine(lineSymbols) {
    const counts = {};
    lineSymbols.forEach(sym => counts[sym] = (counts[sym] || 0) + 1);
    let lineMultiplier = 0;
    for (let sym in counts) {
        if (counts[sym] >= 3) {
            lineMultiplier += multipliers[sym];
        }
    }
    return lineMultiplier;
}

// Вычисление выигрыша по всем комбинациям
function calculateWin(spinResult, bet) {
    let totalMultiplier = 0;

    // Горизонтали
    for (let r = 0; r < rows; r++) {
        const row = spinResult.slice(r * cols, (r + 1) * cols);
        totalMultiplier += checkLine(row);
    }

    // Вертикали
    for (let c = 0; c < cols; c++) {
        const col = [];
        for (let r = 0; r < rows; r++) col.push(spinResult[r * cols + c]);
        totalMultiplier += checkLine(col);
    }

    // Все возможные диагонали длиной 3
    const diagonals = [
        [0,5,10],
        [1,6,11],
        [2,5,8],
        [3,6,9]
    ];

    diagonals.forEach(diag => {
        const line = diag.map(i => spinResult[i]);
        totalMultiplier += checkLine(line);
    });

    return bet * totalMultiplier;
}

// Анимация спина
function animateSpin(cells, finalSymbols) {
    return new Promise(resolve => {
        const duration = 1500;
        const intervalTime = 50;
        let elapsed = 0;

        const interval = setInterval(() => {
            cells.forEach(cell => {
                const randomSymbol = getRandomSymbol();
                cell.textContent = randomSymbol;
            });

            elapsed += intervalTime;
            if (elapsed >= duration) {
                clearInterval(interval);
                cells.forEach((cell, i) => cell.textContent = finalSymbols[i]);
                resolve();
            }
        }, intervalTime);
    });
}

// Спин слотов
spinBtn.addEventListener("click", async () => {
    const bet = Number(betInput.value);
    if (bet <= 0 || bet > getBalance()) {
        alert("⚠️ Некорректная ставка или недостаточно баланса");
        return;
    }

    subtractBalance(bet);
    renderBalance();

    const cells = Array.from(slotsField.children);
    const finalSymbols = cells.map(() => getRandomSymbol());

    await animateSpin(cells, finalSymbols);

    currentWin = calculateWin(finalSymbols, bet);

    if (currentWin > 0) {
        let displayedWin = 0;
        const step = currentWin / 20;
        const winInterval = setInterval(() => {
            displayedWin += step;
            if (displayedWin >= currentWin) {
                displayedWin = currentWin;
                clearInterval(winInterval);
            }
            potentialEl.textContent = `💰 Вы выиграли: ${displayedWin.toFixed(2)} грн`;
        }, 50);

        addBalance(currentWin);
    } else {
        potentialEl.textContent = `💰 Вы выиграли: 0 грн`;
    }

    renderBalance();
});