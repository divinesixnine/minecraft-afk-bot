const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('Bot Manager is Live'));
app.listen(PORT, () => console.log(`[SYSTEM] Web port ${PORT} active`));

// Load settings directly
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

function createBot() {
    console.log(`[BOT] Attempting to join ${settings.host}:${settings.port} as ${settings.username}...`);

    const bot = mineflayer.createBot({
        host: settings.host,
        port: settings.port,
        username: settings.username,
        version: settings.version,
        auth: 'offline',
        hideErrors: false,
        checkTimeoutInterval: 30000
    });

    bot.on('login', () => {
        console.log("[BOT] Handshake successful! Logging in...");
    });

    bot.on('spawn', () => {
        console.log("[BOT] SUCCESS: Bot is now in the server!");
        setTimeout(() => {
            bot.chat(`/login ${settings.password}`);
        }, 5000);
    });

    // Anti-AFK
    setInterval(() => {
        if (bot.entity) bot.setControlState('jump', true);
        setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
    }, 20000);

    bot.on('error', (err) => {
        console.log("[ERROR] Connection failed:", err.message);
    });

    bot.on('kicked', (reason) => {
        console.log("[KICKED] Reason:", reason);
    });

    bot.on('end', () => {
        console.log("[DISCONNECTED] Retrying in 20 seconds...");
        setTimeout(createBot, 20000);
    });
}

createBot();
