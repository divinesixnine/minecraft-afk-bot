const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration
const config = {
    host: 'thelegions.aternos.me',
    port: 62129,
    username: 'FREDDYGOAT',
    password: 'SoloPlayz',
    version: '1.21.1' 
};

// Web Dashboard (To keep Render service alive)
app.get('/', (req, res) => {
    res.send('Service is running. System monitoring active.');
});

app.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

let bot;

function initBot() {
    console.log(`Attempting to connect to ${config.host}:${config.port}...`);

    bot = mineflayer.createBot({
        host: config.host,
        port: config.port,
        username: config.username,
        version: config.version,
        hideErrors: false
    });

    bot.on('spawn', () => {
        console.log('Bot successfully joined the server!');
        
        // Wait 3 seconds then login
        setTimeout(() => {
            bot.chat(`/login ${config.password}`);
            console.log('Login command sent.');
        }, 3000);

        // Anti-AFK: Swings arm every 30 seconds to prevent idle kick
        setInterval(() => {
            if (bot) {
                bot.swingArm();
                // Optional: random look around
                bot.look(Math.random() * Math.PI * 2, 0); 
            }
        }, 30000);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return;
        console.log(`[Chat] ${username}: ${message}`);
    });

    bot.on('kicked', (reason) => {
        const kickReason = JSON.parse(reason);
        console.log('Bot was kicked. Reason:', kickReason.text || reason);
    });

    bot.on('error', (err) => {
        console.log('Connection Error:', err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log('Server is offline. Retrying in 60 seconds...');
        }
    });

    // Auto Reconnect logic
    bot.on('end', () => {
        console.log('Connection lost. Reconnecting in 10 seconds...');
        setTimeout(initBot, 10000);
    });
}

// Start the bot
initBot();
