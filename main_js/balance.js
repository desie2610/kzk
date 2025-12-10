// Глобальный баланс проекта
const BALANCE_KEY = "rzh_balance";

// Получить баланс
export function getBalance() {
    return Number(localStorage.getItem(BALANCE_KEY)) || 0;
}

// Установить баланс
export function setBalance(amount) {
    localStorage.setItem(BALANCE_KEY, amount);
}

// Добавить к балансу
export function addBalance(amount) {
    const current = getBalance();
    setBalance(current + amount);
}

// Вычесть из баланса, но не в минус
export function subtractBalance(amount) {
    const current = getBalance();
    setBalance(Math.max(0, current - amount));
}