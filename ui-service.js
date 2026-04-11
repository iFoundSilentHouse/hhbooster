const UIService = {
    injectButton() {
        // Проверяем, нет ли уже кнопки
        if (document.getElementById('hh-booster-btn')) return;

        // Ищем контейнер в хедере (тот самый fill между поиском и профилем)
        const naviFill = document.querySelector('.supernova-navi-fill');
        
        if (naviFill) {
            const btn = document.createElement('button');
            btn.id = 'hh-booster-btn';
            btn.className = 'my-booster-btn'; // Наш класс из CSS
            btn.innerHTML = '<span>🚀 Прокачать</span>';

            btn.onclick = () => {
                // Вызываем логику редактирования
                if (typeof EditorService !== 'undefined') {
                    EditorService.processEditField();
                }
            };

            // Вставляем кнопку в хедер
            naviFill.parentNode.insertBefore(btn, naviFill);
        }
    }
};

// Запуск в MutationObserver
const observer = new MutationObserver(() => {
    UIService.injectButton();
});
observer.observe(document.body, { childList: true, subtree: true });