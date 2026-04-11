// parser-service.js
const ParserService = {
    // Селекторы блока "О себе"
    getAboutCard: () => document.querySelector('[data-qa="resume-about-card"]'),
    
    getExpandButton: function() {
        const card = this.getAboutCard();
        if (!card) return null;
        return Array.from(card.querySelectorAll('button'))
                    .find(b => b.textContent.toLowerCase().includes('посмотреть всё'));
    },

    getEditorField: () => document.querySelector('textarea[data-qa="resume-editor-about"]'),

    getSaveButton: () => document.querySelector('[data-qa="resume-partial-edit-save"]')
};