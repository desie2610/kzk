import { getBalance, addBalance } from './balance.js';

const balanceEl = document.getElementById("balance");
const promoInput = document.getElementById("promoInput");
const promoBtn = document.getElementById("promoBtn");
const message = document.getElementById("message");

// Список промокодов и бонусов
const promoCodes = {
    "DESIEB3T": 18999,
    "HJEF": "admin" // админский код
};

// Проверка использованных кодов
let usedCodes = JSON.parse(localStorage.getItem("usedPromoCodes")) || [];

function renderBalance() {
    balanceEl.textContent = getBalance().toFixed(2);
}

promoBtn.addEventListener("click", () => {
    const code = promoInput.value.trim().toUpperCase();
    if (!code) return;

    // Проверка: если код не админский, то он одноразовый
    if (code !== "ADMIN" && usedCodes.includes(code)) {
        message.textContent = "❌ Промокод уже использован!";
        return;
    }

    if (promoCodes[code]) {

        if (promoCodes[code] === "admin") {
            // Админский промокод — бесконечный
            let amount = prompt("Введите сумму для пополнения баланса:");
            amount = Number(amount);

            if (!isNaN(amount) && amount > 0 ) {
                addBalance(amount);
                renderBalance();
                message.textContent = `✅ Админский промокод активирован! +${amount} грн`;
            } else {
                message.textContent = "❌ Некорректная сумма!";
            }

            promoInput.value = "";
            return;
        }

        // Обычный промокод
        const bonus = promoCodes[code];
        addBalance(bonus);
        message.textContent = `✅ Промокод активирован! +${bonus} грн`;

        // Записываем только обычные коды
        usedCodes.push(code);
        localStorage.setItem("usedPromoCodes", JSON.stringify(usedCodes));

        promoInput.value = "";
    } else {
        message.textContent = "❌ Неверный промокод!";
    }
});

// Стартовое отображение
renderBalance();