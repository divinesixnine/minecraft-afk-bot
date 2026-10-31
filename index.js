const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;
app.get('/', (req, res) => res.send('System Status: Online'));
app.listen(PORT, () => console.log(`[SYSTEM] Web port ${PORT} active`));

const config = {
    host: 'blackbear.aternos.host',
    port: 62129,
    username: 'FREDDYGOAT',
    password: 'SoloPlayz',
    version: '1.20.1'
};

function createBot() {
    console.log(`[BOT] Connecting to ${config.host}:${config.port}...`);

    const bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        auth: 'offline',
        // These settings help bypass basic firewall blocks
        checkTimeoutInterval: 90000, 
        closeTimeout: 90000,
        hideErrors: false
    });

    bot.on('spawn', () => {
        console.log("[BOT] SUCCESS: Bot spawned!");
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
        }, 5000);
    });

    // Anti-AFK
    setInterval(() => {
        if (bot.entity) {
            bot.setControlState('jump', true);
            setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
        }
    }, 20000);

    bot.on('error', (err) => {
        console.log("[ERROR] Details:", err.message);
    });

    bot.on('kicked', (reason) => {
        console.log("[KICKED] Reason:", reason);
    });

    bot.on('end', () => {
        console.log("[DISCONNECTED] Reconnecting in 30 seconds...");
        setTimeout(createBot, 30000);
    });
}

createBot();
