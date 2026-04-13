const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const port = 3021;

const db = new Database('stats.db');

// Пересоздаем таблицу с ПРАВИЛЬНЫМ ключом
db.exec(`
  CREATE TABLE IF NOT EXISTS counts (
    type TEXT PRIMARY KEY, 
    value INTEGER,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors({
    origin: '*', // В продакшене лучше указать конкретный домен
    methods: ['POST', 'GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
    
    // Если это предварительный запрос от браузера
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        return res.sendStatus(204); // Отвечаем "нет контента", всё ок
    }
    next();
});

app.use(express.json());

app.post('/track', (req, res) => {
    const { type, count } = req.body; // здесь count теперь воспринимается как "+N"

    if (!type || count === undefined) {
        return res.status(400).json({ error: 'Missing data' });
    }

    try {
        // SQL запрос: если тип есть — прибавляем значение, если нет — создаем
        const stmt = db.prepare(`
            INSERT INTO counts (type, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(type) DO UPDATE SET 
                value = value + excluded.value,
                updated_at = CURRENT_TIMESTAMP
        `);
        
        stmt.run(type, count);
        
        console.log(`[${new Date().toLocaleTimeString()}] Добавлено +${count} к ${type}`);
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/stats', (req, res) => {
    const rows = db.prepare('SELECT * FROM counts').all();
    res.json(rows);
});

app.listen(port, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${port}`);
});

