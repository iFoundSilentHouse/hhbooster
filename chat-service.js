const ChatService = {
    clickCount: 0, // Локальный счетчик для этого фрейма

    async clickSuggestionButton() {
        const targets = ['У меня есть профильный опыт', 'Какая схема оплаты?', 'Могу работать в гибком графике'];
        const allButtons = Array.from(document.querySelectorAll('button'));
        
        const target = allButtons.find(btn => {
            const text = btn.innerText.trim();
            return targets.includes(text) || (text.length > 5 && text.length < 50 && !text.includes('\n'));
        });

        if (target) {
            target.click();
            this.clickCount++; // Инкремент при успешном нажатии
            console.log(`[ChatService] Клик №${this.clickCount}: ${target.innerText}`);
            return true;
        }
        return false;
    }
};

window.addEventListener('message', (event) => {
    if (event.data === 'HH_CHAT_TICK') {
        ChatService.clickSuggestionButton();
    }
    // Новый тип сообщения для запроса статистики перед стопом
    if (event.data === 'GET_CHAT_STATS') {
        window.parent.postMessage({ type: 'CHAT_STATS_RESPONSE', count: ChatService.clickCount }, '*');
    }
});