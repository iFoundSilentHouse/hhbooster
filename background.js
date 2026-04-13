// background.js

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'TRACK_STATS') {
        const { type, count } = message.data;

        // Фоновый скрипт имеет право делать fetch на localhost без ограничений PNA
        fetch('http://localhost:3021/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, count })
        })
        .then(response => {
            if (response.ok) {
                console.log(`[ServiceWorker] Успешно отправлено: ${type}`);
            }
        })
        .catch(err => {
            console.error('[ServiceWorker] Ошибка сервера:', err);
        });

        // Возвращаем true, если планируем отправить ответ обратно в content.js позже
        return true; 
    }
});
