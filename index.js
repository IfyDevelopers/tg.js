const { Telegraf } = require('telegraf')
const { message } = require('telegraf/filters')
require('dotenv').config();
const Random = require('./modules/random.js');

const bot = new Telegraf(process.env.TOKEN)


bot.catch((err) => {
    const errorLogPath = path.join(__dirname, 'error.txt');
    const errorMessage = `[${new Date().toISOString()}] ${err}\n`;
    
    fs.appendFile(errorLogPath, errorMessage, (fsErr) => {
        if (fsErr) {
            console.error('Не удалось записать ошибку в файл:', fsErr);
        } else {
            console.log('Ошибка записана в error.txt');
        }
    });
});

const sentences = ["Oh bro nice dick 😘","😘","😍","🥰","😙"];

bot.start((ctx) => ctx.reply('Welcome'))
bot.on(message('sticker'), (ctx) => ctx.reply(Random(sentences)))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))

const CHANNEL_ID = 'ifydevnews';
bot.on('text', (ctx) => {
    const chatId = ctx.chat.id; 
    if (chatId === CHANNEL_ID) {
        ctx.reply('Спасибо за ваше сообщение в нашем канале!');
    }
});




bot.command('cause_error', (ctx) => {
    try {
        // Создадим ошибку
        throw new Error('Это тестовая ошибка!');
    } catch (error) {
        // Записываем ошибку в файл
        logError(error);
        // Отправляем уведомление в чат
        ctx.reply('Произошла ошибка. Администратор был уведомлён.');
    }
});

// Обработчик всех остальных ошибок
bot.catch((err) => {
    logError(err);
    console.error('Произошла ошибка:', err);
});


bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))