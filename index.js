const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');

// 1. Web Service to keep Render alive
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('System Status: Online. Monitoring blackbear.aternos.host');
});

app.listen(PORT, () => {
    console.log(`Web monitoring active on port ${PORT}`);
});

// 2. Load Configuration
let settings;
try {
    settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
} catch (err) {
    console.error("Critical Error: settings.json not found or invalid.");
    process.exit(1);
}

const botArgs = {
    host: settings.server.host,
    port: settings.server.port,
    username: settings.bot.username,
    version: settings.server.version,
    auth: settings.bot.auth
};

let bot;

function createBot() {
    console.log(`Connecting as ${botArgs.username} to ${botArgs.host}:${botArgs.port}...`);
    
    bot = mineflayer.createBot(botArgs);

    // Event: Successfully joined the server
    bot.on('spawn', () => {
        console.log("Bot spawned in the world.");
        
        // Handle Auto-Login
        if (settings.options.autoLogin) {
            setTimeout(() => {
                bot.chat(`/login ${settings.bot.password}`);
                console.log("Login command sent to chat.");
            }, 5000);
        }

        // Anti-AFK Logic (Jump every 25 seconds)
        if (settings.options.antiAfk) {
            setInterval(() => {
                if (bot && bot.entity) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                }
            }, 25000);
        }
    });

    // Logging & Error Handling
    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] ${username}: ${message}`);
    });

    bot.on('kicked', (reason) => {
        console.log("Kicked from server. Reason:", reason);
    });

    bot.on('error', (err) => {
        console.log("Connection Error:", err.message);
        if (err.code === 'ETIMEDOUT') {
            console.log("Attempt failed: Connection timed out.");
        }
    });

    // Auto-Reconnect Logic
    bot.on('end', () => {
        console.log(`Connection lost. Reconnecting in ${settings.options.reconnectDelay / 1000} seconds...`);
        setTimeout(createBot, settings.options.reconnectDelay);
    });
}

// Start the process
createBot();
