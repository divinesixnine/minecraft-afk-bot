const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000; // Render uses 10000 often

app.get('/', (req, res) => res.send('System Status: Online'));
app.listen(PORT, () => console.log(`Web monitoring on port ${PORT}`));

const botArgs = {
    host: 'thelegions.aternos.me',
    port: 62129,
    username: 'FREDDYGOAT',
    version: '1.20.1', // Strict version
    auth: 'offline'    // Explicitly set offline mode for Cracked
};

let bot;

function createBot() {
    console.log("--- Initializing Bot Connection ---");
    bot = mineflayer.createBot(botArgs);

    // This handles the login/spawn process
    bot.on('login', () => {
        console.log(`Bot logged in as ${bot.username}`);
    });

    bot.on('spawn', () => {
        console.log("Bot spawned in the world.");
        
        // Wait 5 seconds to ensure world is loaded before chatting
        setTimeout(() => {
            bot.chat('/login SoloPlayz');
            console.log("Sent login command.");
        }, 5000);

        // Movement to prevent AFK kick
        setInterval(() => {
            if (bot && bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }
        }, 20000);
    });

    // Handle Kicks - This will log exactly why it failed
    bot.on('kicked', (reason) => {
        console.log("KICKED ERROR:", reason);
        // If reason is empty string, it's often a version mismatch or proxy issue
    });

    bot.on('error', (err) => {
        console.log("RUNTIME ERROR:", err.message);
    });

    bot.on('end', () => {
        console.log("Connection closed. Attempting to reconnect in 15 seconds...");
        setTimeout(createBot, 15000);
    });
}

// Start the sequence
createBot();
