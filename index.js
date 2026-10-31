const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

// Web Server for Render
app.get('/', (req, res) => res.send('Bot System Running'));
app.listen(PORT, () => console.log(`Web portal active on port ${PORT}`));

// Configuration from your setting.json
const config = {
    host: 'thelegions.aternos.me',
    port: 62129,
    username: 'FREDDYGOAT',
    password: 'SoloPlayz',
    version: '1.20.1' // CHANGED TO 1.20.1 AS PER YOUR JSON
};

const messages = [
    "I'm a regular player",
    "Subscribe to FREDDY PLAYZ!",
    "LEGIONS ON TOP"
];

let bot;

function createBot() {
    console.log(`Connecting to ${config.host}:${config.port} on version ${config.version}...`);
    
    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version
    });

    bot.on('spawn', () => {
        console.log('Bot joined the game!');
        
        // 1. Auto Login
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
        }, 3000);

        // 2. Anti-AFK & Movement (Random Jump & Sneak)
        setInterval(() => {
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
            bot.setControlState('sneak', true);
            setTimeout(() => bot.setControlState('sneak', false), 1000);
        }, 15000);

        // 3. Periodic Chat Messages (Every 7.5 minutes as per your 460s delay)
        setInterval(() => {
            const msg = messages[Math.floor(Math.random() * messages.length)];
            bot.chat(msg);
        }, 460000);
    });

    bot.on('error', (err) => {
        console.log('Error encountered:', err.message);
        if (err.code === 'ETIMEDOUT') {
            console.log('CRITICAL: Connection Timed Out. Check if the Port 62129 is still active in Aternos!');
        }
    });

    bot.on('end', () => {
        console.log('Disconnected. Reconnecting in 10 seconds...');
        setTimeout(createBot, 10000);
    });

    bot.on('kicked', (reason) => {
        console.log('Kicked from server. Reason:', reason);
    });
}

createBot();
