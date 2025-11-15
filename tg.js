import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";

dotenv.config();
const token = process.env.TG;
const bot = new TelegramBot(token, {polling: true});

const sendMessage = (text) => {
    bot.sendMessage('-4774407794', text)
}

module.exports = { sendMessage }