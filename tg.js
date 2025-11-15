import TelegramBot from 'node-telegram-bot-api';
import dotenv from "dotenv";

dotenv.config();
const token = process.env.TG;
const bot = new TelegramBot(token, {polling: true});

export const sendMessage = (text) => {
    bot.sendMessage('-4774407794', text, { parse_mode: 'MarkdownV2' })
}