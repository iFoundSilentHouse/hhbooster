// editor-service.js
const AboutEditorService = {
    // Вспомогательный метод трансформации
    transformText(input) {
        let newText = input.trim();

        // Логика с точкой в конце
        if (newText.endsWith('.')) {
            newText = newText.replace(/\.+$/, "");
            console.log("Точка удалена");
        } else {
            newText = newText + ".";
            console.log("Точка добавлена");
        }

        return newText;
    },

    // Основная последовательность действий
    async executeSequence() {
        let textarea = ParserService.getEditorField();

        // Если не в режиме правки — пробуем открыть
        if (!textarea) {
            const expandBtn = ParserService.getExpandButton();
            if (expandBtn) {
                expandBtn.click();
                
                // Ожидание появления поля
                for (let i = 0; i < 10; i++) {
                    await new Promise(r => setTimeout(r, 200));
                    textarea = ParserService.getEditorField();
                    if (textarea) break;
                }
            }
        }

        if (textarea) {
            const original = textarea.value;
            const modified = this.transformText(original);

            if (original !== modified) {
                textarea.value = modified;
                textarea.dispatchEvent(new Event('input', { bubbles: true }));
                
                await new Promise(r => setTimeout(r, 500));
                
                const saveBtn = ParserService.getSaveButton();
                if (saveBtn) {
                    saveBtn.click();
                    console.log('[AboutEditor] Изменения сохранены');

                    if (typeof incrementUpdateCount === 'function') {
                        incrementUpdateCount();
                    }
                }
            }
        }
    }
};