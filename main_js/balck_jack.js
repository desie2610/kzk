// Убедись, что balance.js есть в ../main_js/balance.js и экспортирует getBalance/addBalance
import { getBalance, addBalance } from "./balance.js";

const dealerCardsEl = document.getElementById("dealerCards");
const playerCardsEl = document.getElementById("playerCards");

const dealerScoreEl = document.getElementById("dealerScore");
const playerScoreEl = document.getElementById("playerScore");

const btnStart = document.getElementById("btnStart");
const btnHit = document.getElementById("btnHit");
const btnStand = document.getElementById("btnStand");

const messageEl = document.getElementById("message");

// Новые элементы ставки
const betInput = document.getElementById("betInput");
const betBtn = document.getElementById("betBtn");
const balanceEl = document.getElementById("balance");

let deck = [];
let playerCards = [];
let dealerCards = [];
let dealerHiddenCard = null;
let gameActive = false;
let currentBet = 0;

// Показать баланс
function renderBalance() {
    balanceEl.textContent = getBalance().toFixed(2);
}
renderBalance();

// Создание колоды
function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
    const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    deck = [];

    for (let s of suits) {
        for (let v of values) {
            deck.push({ value: v, suit: s });
        }
    }

    // тасуем (простейший)
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function drawCard() {
    return deck.pop();
}

// Подсчёт очков
function calcScore(cards) {
    let sum = 0;
    let aces = 0;

    for (let c of cards) {
        if (c.value === "A") {
            aces++;
            sum += 11;
        } else if (["J", "Q", "K"].includes(c.value)) {
            sum += 10;
        } else {
            sum += Number(c.value);
        }
    }

    while (sum > 21 && aces > 0) {
        sum -= 10;
        aces--;
    }
    return sum;
}

// Рендер карты
function renderCards(element, cards, hideFirst = false) {
    element.innerHTML = "";

    cards.forEach((c, i) => {
        const div = document.createElement("div");
        div.classList.add("card");

        if (hideFirst && i === 0) {
            div.classList.add("back");
            div.textContent = "R";
        } else {
            div.textContent = c.value + c.suit;
            if (c.suit === "♥" || c.suit === "♦") div.classList.add("red");
        }

        element.appendChild(div);
    });
}

// Обновление интерфейса
function render() {
    renderCards(playerCardsEl, playerCards);
    renderCards(dealerCardsEl, dealerCards, true);

    playerScoreEl.textContent = "Очки: " + calcScore(playerCards);
    dealerScoreEl.textContent = "Очки: ?";
}

// Обработчик "Поставить"
betBtn.addEventListener("click", () => {
    const amount = Number(betInput.value);

    if (amount <= 0 || isNaN(amount)) {
        messageEl.textContent = "❌ Некорректная ставка";
        return;
    }

    if (amount > getBalance()) {
        messageEl.textContent = "❌ Недостаточно баланса";
        return;
    }

    currentBet = amount;
    // снимаем ставку (addBalance принимает положительное/отрицательное)
    addBalance(-amount);
    renderBalance();

    messageEl.textContent = `💰 Ставка принята: ${amount} грн`;

    btnStart.disabled = false;
});

// Начало игры
btnStart.addEventListener("click", () => {
    if (currentBet <= 0) {
        messageEl.textContent = "❌ Сделай ставку!";
        return;
    }

    createDeck();
    playerCards = [];
    dealerCards = [];
    messageEl.textContent = "";
    gameActive = true;

    dealerHiddenCard = drawCard();
    dealerCards.push(dealerHiddenCard);
    dealerCards.push(drawCard());

    playerCards.push(drawCard());
    playerCards.push(drawCard());

    btnHit.disabled = false;
    btnStand.disabled = false;
    btnStart.disabled = true;

    render();
});

// "Взять карту"
btnHit.addEventListener("click", () => {
    if (!gameActive) return;

    playerCards.push(drawCard());
    render();

    if (calcScore(playerCards) > 21) {
        endGame("❌ Перебор! Ты проиграл!", false);
    }
});

// "Хватит"
btnStand.addEventListener("click", () => {
    if (!gameActive) return;

    btnHit.disabled = true;
    btnStand.disabled = true;

    setTimeout(() => {
        playDealer();
    }, 600);
});

// Логика дилера — медленнее (2100ms интервал)
function playDealer() {
    renderCards(dealerCardsEl, dealerCards);

    let dealerScore = calcScore(dealerCards);

    const interval = setInterval(() => {
        if (dealerScore < 17) {
            dealerCards.push(drawCard());
            renderCards(dealerCardsEl, dealerCards);
            dealerScore = calcScore(dealerCards);
        } else {
            clearInterval(interval);
            finishGame();
        }
    }, 2100);
}

function finishGame() {
    const p = calcScore(playerCards);
    const d = calcScore(dealerCards);

    dealerScoreEl.textContent = "Очки: " + d;

    if (d > 21 || p > d) {
        endGame(`✅ Ты выиграл! +${currentBet * 2} грн`, true);
    } else if (p === d) {
        endGame("➖ Ничья! Тебе вернули деньги", "draw");
    } else {
        endGame("❌ Ты проиграл!", false);
    }
}

function endGame(text, win) {
    gameActive = false;
    btnHit.disabled = true;
    btnStand.disabled = true;

    renderCards(dealerCardsEl, dealerCards);

    if (win === true) {
        addBalance(currentBet * 2);
    } else if (win === "draw") {
        addBalance(currentBet);
    }

    renderBalance();
    messageEl.textContent = text;

    currentBet = 0;
    betInput.value = "";
    btnStart.disabled = true;
}

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