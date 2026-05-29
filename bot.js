const bedrock = require('bedrock-protocol');
const fs = require('fs');

// Read config from config.json
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

function createBot() {
    console.log("Connecting to Minecraft Bedrock server...");
    
    const bot = bedrock.createClient({
        host: config.serverHost,
        port: config.serverPort,
        username: config.botUsername || "AFK_Bot",
        offline: true
    });

    let moveInterval;

    bot.on('spawn', () => {
        console.log("Bot has successfully joined the server!");

        // Start random movement system every 3 seconds to prevent AFK kick
        moveInterval = setInterval(() => {
            if (!bot.write) return; // Check if bot is still connected

            // Generate random movements for the bot
            const isMovingForward = Math.random() > 0.5;
            const isJumping = Math.random() > 0.7;
            const isSneaking = Math.random() > 0.8;

            // Send movement data to the server
            bot.write('player_auth_input', {
                pitch: 0,
                yaw: Math.random() * 360, // Rotate randomly
                position: { x: 0, y: 0, z: 0 },
                move_vector: { x: isMovingForward ? 1 : 0, z: 0 },
                input_data: {
                    jumper: isJumping,
                    sneaker: isSneaking,
                    moving: isMovingForward
                },
                input_mode: 'mouse',
                play_mode: 'normal',
                tick: 0n
            });

            console.log(Bot Actions -> Moving: ${isMovingForward}, Jumping: ${isJumping}, Sneaking: ${isSneaking});
        }, 3000);
    });

    bot.on('close', () => {
        console.log("Connection lost. Reconnecting in 30 seconds...");
        clearInterval(moveInterval); // Stop interval on disconnect
        setTimeout(createBot, 30000);
    });

    bot.on('error', (err) => {
        console.log("Connection error: ", err.message);
        clearInterval(moveInterval);
    });
}

createBot();
