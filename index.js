const mineflayer = require('mineflayer');
const express = require('express');

// 1. Web Server to keep Render service alive
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('AFK Bot Manager is running.');
});

app.listen(PORT, () => {
    console.log(`[SYSTEM] Web server active on port ${PORT}`);
});

// 2. Server Configuration
const config = {
    host: 'blackbear.aternos.host',
    port: 62129,
    username: 'FREDDYGOAT',
    password: 'SoloPlayz',
    version: '1.20.1'
};

let bot;

function createBot() {
    console.log(`[BOT] Attempting to connect to ${config.host}:${config.port} as ${config.username}...`);

    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        auth: 'offline', // Required for Aternos Cracked servers
        checkTimeoutInterval: 60000
    });

    // Successfully joined the server
    bot.on('spawn', () => {
        console.log("[BOT] SUCCESS: Bot has spawned in the server!");
        
        // Auto Login Sequence
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
            console.log("[BOT] Login command sent.");
        }, 5000);
    });

    // Anti-AFK Logic (Jumps every 20 seconds to prevent idle kick)
    setInterval(() => {
        if (bot && bot.entity) {
            bot.setControlState('jump', true);
            setTimeout(() => { 
                if (bot.entity) bot.setControlState('jump', false); 
            }, 500);
        }
    }, 20000);

    // Error Handling
    bot.on('error', (err) => {
        console.log("[ERROR] Connection Error:", err.message);
    });

    // Kick Handling
    bot.on('kicked', (reason) => {
        console.log("[KICKED] Bot was kicked from the server. Reason:", reason);
    });

    // Auto Reconnect Logic
    bot.on('end', () => {
        console.log("[DISCONNECTED] Connection lost. Reconnecting in 20 seconds...");
        setTimeout(createBot, 20000);
    });
}

// 3. Start the Bot
createBot();
