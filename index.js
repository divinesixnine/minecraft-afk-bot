const mineflayer = require('mineflayer');
const express = require('express');
const fs = require('fs');

// Load settings from JSON
const settings = JSON.parse(fs.readFileSync('settings.json', 'utf8'));

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('System Status: Monitoring 1.20.1 Bot'));
app.listen(PORT, () => console.log(`Web portal active on port ${PORT}`));

const botArgs = {
    host: settings.server.ip,
    port: settings.server.port,
    username: settings["bot-account"].username,
    version: settings.server.version, 
    auth: settings["bot-account"].type
};

let bot;

function createBot() {
    console.log(`Connecting to ${botArgs.host} on version ${botArgs.version}...`);
    bot = mineflayer.createBot(botArgs);

    bot.on('spawn', () => {
        console.log("Bot joined the server successfully!");
        
        // Auto Login
        if (settings.utils["auto-auth"]) {
            setTimeout(() => {
                bot.chat(`/login ${settings["bot-account"].password}`);
                console.log("Sent login command.");
            }, 5000);
        }

        // Anti-AFK
        if (settings.utils["anti-afk"]) {
            setInterval(() => {
                if (bot && bot.entity) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 500);
                }
            }, 20000);
        }
    });

    bot.on('kicked', (reason) => console.log("Kicked. Reason:", reason));
    bot.on('error', (err) => console.log("Error:", err.message));
    bot.on('end', () => {
        console.log("Disconnected. Reconnecting in 15 seconds...");
        setTimeout(createBot, 15000);
    });
}

createBot();
