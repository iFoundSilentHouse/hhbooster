// chat-service.js
const ChatService = {
    clickCount: 0,

    async clickSuggestionButton() {
        const targets = ['У меня есть профильный опыт', 'Какая схема оплаты?', 'Могу работать в гибком графике'];
        const allButtons = Array.from(document.querySelectorAll('button'));

        const target = allButtons.find(btn => {
            const text = btn.innerText.trim();
            return targets.includes(text) || (text.length > 5 && text.length < 50 && !text.includes('\n'));
        });

        if (target) {
            target.click();
            this.clickCount++;
            window.parent.postMessage({
                type: 'CHAT_INCREMENT_EVENT',
                count: 1 // Всегда шлем 1 при каждом клике
            }, '*');

            console.log(`[ChatService] Клик зафиксирован: ${this.clickCount}`);
            return true;
        }
        return false;
    }
};

window.addEventListener('message', (event) => {
    if (event.data === 'HH_CHAT_TICK') {
        ChatService.clickSuggestionButton();
    }
    if (event.data === 'GET_CHAT_STATS') {
        window.parent.postMessage({ type: 'CHAT_STATS_RESPONSE', count: ChatService.clickCount }, '*');
    }
});
