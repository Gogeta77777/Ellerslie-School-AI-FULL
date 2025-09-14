const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'saveData.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Load users from saveData.json
async function loadUsers() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

// Save users to saveData.json
async function saveUsers(users) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving users:', error);
        return false;
    }
}

// API Routes
app.get('/api/users', async (req, res) => {
    try {
        const users = await loadUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load users' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const users = req.body;
        const success = await saveUsers(users);
        if (success) {
            res.json({ message: 'Users saved successfully' });
        } else {
            res.status(500).json({ error: 'Failed to save users' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to save users' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Ellerslie School AI server running on port ${PORT}`);
    console.log(`📱 Open http://localhost:${PORT} to access the AI`);
    console.log(`🤖 Model: ESAI-Alpha-1`);
    console.log(`🏢 Made by The Ellerslie School AI Company`);
});