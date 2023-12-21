const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TOKEN; // Replace with your actual bot token
const bot = new TelegramBot(token, { polling: true });

// In-memory storage to keep track of counts
const linkCounts = {};

// Event handler for updates in chat members
bot.on('chatMemberUpdated', async (update) => {
    const chatId = update.chat.id;
    const userId = update.from.id;
    const status = update.new_chat_member.status; // 'member' or 'left' or 'kicked'

    if (status === 'member') {
        // User joined the chat
        handleUserJoined(chatId, userId);
    } else if (status === 'left' || status === 'kicked') {
        // User left or was kicked from the chat
        handleUserLeft(chatId, userId);
    }
});

// Periodically check and update counts for invite links
setInterval(() => {
    for (const link in linkCounts) {
        getInviteLinkMembers(link);
    }
}, 5000); // Adjust the interval as needed (in milliseconds)

// Helper function to handle user joining
function handleUserJoined(chatId, userId) {
    // Implement your logic here
    console.log(`User ${userId} joined the chat ${chatId}`);
}

// Helper function to handle user leaving
function handleUserLeft(chatId, userId) {
    // Implement your logic here
    console.log(`User ${userId} left or was kicked from the chat ${chatId}`);
}

// Helper function to get invite link members and update counts
async function getInviteLinkMembers(link) {
    try {
        const response = await bot.getInviteLinkMembers(link);
        const chatId = response.chat.id;
        const members = response.members;

        // Update counts based on the members list
        const joinedCount = members.filter((member) => member.status === 'member').length;
        const leftCount = members.filter((member) => member.status === 'left' || member.status === 'kicked').length;

        // Update in-memory storage
        linkCounts[link] = { joined: joinedCount, left: leftCount };

        // Send a message or perform further actions if needed
        console.log(`Invite link ${link}: Joined: ${joinedCount}, Left: ${leftCount}`);
    } catch (error) {
        console.error('Error getting invite link members:', error.message);
    }
}
