const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/telegram_tracking', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Create a schema for tracking information
const trackingSchema = new mongoose.Schema({
    inviteLink: {
        type: String,
        required: true,
        unique: true,
    },
    joinedCount: {
        type: Number,
        default: 0,
    },
    leftCount: {
        type: Number,
        default: 0,
    },
});

// Create a model for tracking information
const Tracking = mongoose.model('Tracking', trackingSchema);

// Set up the Telegram bot
const botToken = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(botToken, { polling: true });

// Middleware to parse JSON
app.use(bodyParser.json());

// Event handler for updates in chat members
bot.on('chatMemberUpdated', async (update) => {
    const chatId = update.chat.id;
    const inviteLink = getInviteLinkFromChat(update.chat);
    const status = update.new_chat_member.status; // 'member' or 'left' or 'kicked'

    try {
        let trackingInfo = await Tracking.findOne({ inviteLink });

        if (!trackingInfo) {
            trackingInfo = new Tracking({ inviteLink });
        }

        if (status === 'member') {
            // User joined the chat
            trackingInfo.joinedCount += 1;
        } else if (status === 'left' || status === 'kicked') {
            // User left or was kicked from the chat
            trackingInfo.leftCount += 1;
        }

        await trackingInfo.save();
    } catch (error) {
        console.error('Error updating tracking information:', error.message);
    }
});

// Helper function to extract the invite link from the chat
function getInviteLinkFromChat(chat) {
    // Implement your logic to extract the invite link from the chat
    // For simplicity, let's assume the link is a URL in the chat's description
    return chat.description || '';
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
