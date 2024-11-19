const { Telegraf } = require('telegraf')
const https = require('https');
require('dotenv').config();
const config = require('./config');
const os = require('os');  
const process = require('process'); 
const axios = require('axios'); 
const { performance } = require('perf_hooks'); 
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const { registerCommand, registerTextCommand, getCommands, getTextCommands } = require('./modules/commandHelper');



const bot = new Telegraf(process.env.TOKEN)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });



fs.readdirSync('./commands').forEach(file => {
  if (file.endsWith('.js')) {
    require(path.join(__dirname, 'commands', file))(bot);
  }
});



bot.catch(async (err, ctx) => {
  console.error('Произошла ошибка:', err);
  if (ctx && ctx.message) {
      await ctx.reply('Произошла ошибка', { reply_to_message_id: ctx.message.message_id });
  } else {
      console.error('Ошибка произошла без контекста сообщения');
  }
});



bot.start(async (ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))
registerTextCommand(bot, 'hi', 'hi', 'Поприветствовать.', async (ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))



registerCommand(bot, 'help', 'Показать список доступных команд.', async (ctx) => {
    let helpMessage = 'Доступные команды:\n';

    const commandsList = getCommands();
    commandsList.forEach(({ command, description }) => {
        helpMessage += `/${command} - ${description}\n`;
    });

    helpMessage += '\nТекстовые команды:\n';
    const textCommandsList = getTextCommands();
    textCommandsList.forEach(({ displayName, description }) => {
        helpMessage += `${displayName} - ${description}\n`;
    });

    ctx.reply(helpMessage);
});



bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))