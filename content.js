// content.js

// --- СОСТОЯНИЕ РЕДАКТОРА (ABOUT) ---
function getEditorState() { return sessionStorage.getItem('isAboutEditorEnabled') === 'true'; }
function setEditorState(isActive) { sessionStorage.setItem('isAboutEditorEnabled', isActive); }
function getUpdateCount() { return parseInt(sessionStorage.getItem('aboutEditorUpdateCount') || '0', 10); }
function incrementUpdateCount() { sessionStorage.setItem('aboutEditorUpdateCount', getUpdateCount() + 1); }
function resetUpdateCount() { sessionStorage.setItem('aboutEditorUpdateCount', '0'); }

// --- СОСТОЯНИЕ ЧАТА ---
// Инициализируем переменную сразу из памяти
let isChatAutoReplyEnabled = sessionStorage.getItem('isChatAutoReplyEnabled') === 'true';
let chatInterval = null;

// --- ЛОГИКА РЕДАКТОРА ---
function toggleAboutEditor() {
    const btn = document.getElementById('hh-booster-btn');
    if (!btn) return;
    const currentState = !getEditorState();
    setEditorState(currentState);
    applyAboutButtonState(btn, currentState);
    if (currentState) {
        resetUpdateCount();
        startAboutEditorCycle();
    } else {
        const total = getUpdateCount();
        stopAboutEditorCycle();
        setTimeout(() => alert(`Работа завершена!\nОбновлено: ${total} раз.`), 100);
    }
}

function applyAboutButtonState(btn, isActive) {
    btn.style.backgroundColor = isActive ? '#dc3545' : '#28a745';
    btn.innerHTML = isActive ? '<span>🛑 Стоп: Редактор</span>' : '<span>📝 Запуск: Редактор</span>';
}

function startAboutEditorCycle() {
    stopAboutEditorCycle();
    const blob = new Blob([`setInterval(() => postMessage('tick'), 10000);`], { type: 'text/javascript' });
    window.aboutEditorWorker = new Worker(URL.createObjectURL(blob));
    window.aboutEditorWorker.onmessage = (e) => {
        if (e.data === 'tick' && getEditorState()) AboutEditorService.executeSequence();
    };
    AboutEditorService.executeSequence();
}

function stopAboutEditorCycle() {
    if (window.aboutEditorWorker) { window.aboutEditorWorker.terminate(); window.aboutEditorWorker = null; }
}

// --- ЛОГИКА ЧАТА ---
let chatResolve = null; // Глобальный "замок" для ожидания ответа

// Универсальный слушатель сообщений
window.addEventListener('message', (event) => {
    // Если пришел ответ со статистикой и у нас есть кто-то, кто его ждет (chatResolve)
    if (event.data && event.data.type === 'CHAT_STATS_RESPONSE') {
        if (chatResolve) {
            chatResolve(event.data.count); // "Отпираем" замок и передаем число
            chatResolve = null;
        }
    }
});

// Функция для запроса статистики с ожиданием (Promise)
function getFinalStats() {
    return new Promise((resolve) => {
        const iframe = document.querySelector('iframe.chatik-integration-iframe');
        if (!iframe) return resolve(0);

        chatResolve = resolve; // Сохраняем функцию resolve, чтобы вызвать её, когда придет сообщение
        iframe.contentWindow.postMessage('GET_CHAT_STATS', '*');

        // Тайм-аут на случай, если фрейм не ответит (предохранитель)
        setTimeout(() => {
            if (chatResolve) {
                resolve(0);
                chatResolve = null;
            }
        }, 500);
    });
}

async function toggleChatAutoReply() {
    const btn = document.getElementById('hh-chat-booster-btn');
    if (!btn) return;

    isChatAutoReplyEnabled = !isChatAutoReplyEnabled;
    sessionStorage.setItem('isChatAutoReplyEnabled', isChatAutoReplyEnabled);

    if (isChatAutoReplyEnabled) {
        // ЗАПУСК
        btn.style.backgroundColor = '#dc3545';
        btn.innerText = '🛑 Стоп чат';
        startChatCycle();
    } else {
        // ОСТАНОВКА
        btn.style.backgroundColor = '#007abc';
        btn.innerText = '🤖 Авто-чат';

        // 1. Сначала запрашиваем данные у фрейма и ждем их
        const finalCount = await getFinalStats();
        
        // 2. Останавливаем воркер
        stopChatCycle();

        // 3. Выводим результат
        alert(`Автоответчик остановлен.\nОтправлено быстрых ответов: ${finalCount}`);
    }
}

function startChatCycle() {
    stopChatCycle();
    
    const blob = new Blob([`setInterval(() => postMessage('tick'), 10000);`], { type: 'text/javascript' });
    window.chatWorker = new Worker(URL.createObjectURL(blob));
    
    window.chatWorker.onmessage = (e) => {
        if (e.data === 'tick' && sessionStorage.getItem('isChatAutoReplyEnabled') === 'true') {
            sendTickToChatIframe();
        }
    };
    
    // Сразу запускаем первый раз
    sendTickToChatIframe();
}

function sendTickToChatIframe() {
    const iframe = document.querySelector('iframe.chatik-integration-iframe');
    if (iframe && iframe.contentWindow) {
        // Посылаем сигнал внутрь фрейма
        iframe.contentWindow.postMessage('HH_CHAT_TICK', '*');
        console.log('[Main] Сигнал "Tick" отправлен во фрейм чата');
    } else {
        console.log('[Main] Фрейм чата не найден');
    }
}

function stopChatCycle() {
    if (window.chatWorker) { window.chatWorker.terminate(); window.chatWorker = null; }
}

// --- ИНИЦИАЛИЗАЦИЯ UI ---
function initUI() {
    // 1. Кнопка Редактора
    if (!document.getElementById('hh-booster-btn')) {
        const naviFill = document.querySelector('.supernova-navi-fill');
        if (naviFill) {
            const btn = document.createElement('button');
            btn.id = 'hh-booster-btn';
            btn.className = 'my-booster-btn';
            applyAboutButtonState(btn, getEditorState());
            btn.onclick = toggleAboutEditor;
            naviFill.parentNode.insertBefore(btn, naviFill);
            if (getEditorState() && !window.aboutEditorWorker) startAboutEditorCycle();
        }
    }

    // 2. Кнопка Чата (более надежный селектор)
    if (!document.getElementById('hh-chat-booster-btn')) {
        const actionsContainer = document.querySelector('.widget-header-actions');
        if (actionsContainer) {
            const chatBtn = document.createElement('button');
            chatBtn.id = 'hh-chat-booster-btn';
            chatBtn.style.cssText = `
                background: #007abc; color: white !important; border: none; border-radius: 4px;
                padding: 4px 10px; margin-right: 12px; cursor: pointer; font-size: 11px;
                font-weight: bold; z-index: 9999;
            `;
            
            const isActive = sessionStorage.getItem('isChatAutoReplyEnabled') === 'true';
            chatBtn.innerText = isActive ? '🛑 Стоп чат' : '🤖 Авто-чат';
            if (isActive) {
                chatBtn.style.backgroundColor = '#dc3545';
                if (!window.chatWorker) startChatCycle();
            }

            chatBtn.onclick = (e) => { e.stopPropagation(); toggleChatAutoReply(); };
            actionsContainer.prepend(chatBtn);
            console.log('Кнопка чата добавлена');
        }
    }
}

// --- ЗАПУСК НАБЛЮДАТЕЛЯ (КРИТИЧНО!) ---
const observer = new MutationObserver(() => {
    initUI();
});

// Запускаем сразу и начинаем слежку
initUI();
observer.observe(document.body, { childList: true, subtree: true });