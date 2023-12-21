const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
require("dotenv").config()

// Replace 'YOUR_TELEGRAM_BOT_TOKEN' with your actual bot token
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/telegram_tracking');

// Create a schema for tracking information
const trackingSchema = new mongoose.Schema({
    link: String,
    joinedCount: Number,
});

// Create a model for tracking information
const Tracking = mongoose.model('Tracking', trackingSchema);

// Event handler for new members joining the group
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});

bot.on('new_chat_members', async (msg) => {
    const chatId = msg.chat.id;
    const link = msg.text; // Assuming the link is sent as a message text

    // Find or create tracking information for the link
    let trackingInfo = await Tracking.findOne({ link });

    if (!trackingInfo) {
        trackingInfo = new Tracking({ link, joinedCount: 0 });
    }

    // Update the joined count
    trackingInfo.joinedCount += 1;
    await trackingInfo.save();

    // Send a message with the updated joined count
    bot.sendMessage(chatId, `New member joined using the link ${link}. Total joined: ${trackingInfo.joinedCount}`);
});