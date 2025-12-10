import { getBalance, addBalance, subtractBalance } from "./balance.js";

const balanceEl = document.getElementById("balance");
const betInput = document.getElementById("bet");
const dealerCardsEl = document.getElementById("dealerCards");
const playerCardsEl = document.getElementById("playerCards");
const dealerSumEl = document.getElementById("dealerSum");
const playerSumEl = document.getElementById("playerSum");
const message = document.getElementById("message");

const hitBtn = document.getElementById("hit");
const standBtn = document.getElementById("stand");
const restartBtn = document.getElementById("restart");

let deck = [];
let dealer = [];
let player = [];
let bet = 0;

// обновить баланс
function renderBalance() {
    balanceEl.textContent = getBalance().toFixed(2);
}

// создать новую колоду
function createDeck() {
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    const suits = ["♠", "♥", "♦", "♣"];

    deck = [];

    for (let v of values) {
        for (let s of suits) {
            deck.push({ value: v, suit: s });
        }
    }

    deck.sort(() => Math.random() - 0.5);
}

// расчёт очков
function cardValue(card) {
    if (["J","Q","K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return Number(card.value);
}

function calcSum(hand) {
    let sum = hand.reduce((acc, card) => acc + cardValue(card), 0);
    let aces = hand.filter(c => c.value === "A").length;

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

// отображение карт
function renderHands() {
    dealerCardsEl.innerHTML = dealer.map(c => `<div class="card">${c.value}${c.suit}</div>`).join("");
    playerCardsEl.innerHTML = player.map(c => `<div class="card">${c.value}${c.suit}</div>`).join("");

    dealerSumEl.textContent = "Сумма: " + calcSum(dealer);
    playerSumEl.textContent = "Сумма: " + calcSum(player);
}

// начать игру
function startGame() {
    message.textContent = "";

    bet = Number(betInput.value);
    if (bet <= 0 || isNaN(bet)) {
        message.textContent = "⚠️ Введите ставку!";
        return;
    }
    if (bet > getBalance()) {
        message.textContent = "⚠️ Недостаточно средств!";
        return;
    }

    subtractBalance(bet);
    renderBalance();

    createDeck();
    dealer = [deck.pop(), deck.pop()];
    player = [deck.pop(), deck.pop()];

    renderHands();
}

// Hit
hitBtn.addEventListener("click", () => {
    player.push(deck.pop());
    renderHands();

    if (calcSum(player) > 21) {
        message.textContent = "💥 Перебор! Ты проиграл.";
        lock();
    }
});

// Stand
standBtn.addEventListener("click", () => {
    // дилер тянет до 17
    while (calcSum(dealer) < 17) {
        dealer.push(deck.pop());
    }

    renderHands();
    checkWinner();
});

// Проверка победителя
function checkWinner() {
    let ps = calcSum(player);
    let ds = calcSum(dealer);

    if (ds > 21 || ps > ds) {
        addBalance(bet * 2);
        message.textContent = "🎉 Ты выиграл!";
    } else if (ps === ds) {
        addBalance(bet);
        message.textContent = "🤝 Ничья!";
    } else {
        message.textContent = "❌ Проигрыш!";
    }

    renderBalance();
    lock();
}

// блок кнопок
function lock() {
    hitBtn.disabled = true;
    standBtn.disabled = true;
}

// рестарт
restartBtn.addEventListener("click", () => {
    hitBtn.disabled = false;
    standBtn.disabled = false;
    dealer = [];
    player = [];
    dealerCardsEl.innerHTML = "";
    playerCardsEl.innerHTML = "";
    dealerSumEl.textContent = "";
    playerSumEl.textContent = "";
    message.textContent = "";
    startGame();
});

// старт отображения
renderBalance();