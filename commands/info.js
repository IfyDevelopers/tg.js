const os = require('os');  
require('dotenv').config();
const config = require('../config');
const { registerCommand, registerTextCommand, getCommands, getTextCommands } = require('../modules/commandHelper');
module.exports = (bot) => {
function formatUptime(uptimeInSeconds) {
    const days = Math.floor(uptimeInSeconds / (3600 * 24));
    const hours = Math.floor((uptimeInSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeInSeconds % 60);
    
    let uptimeString = '';
    
    if (days > 0) uptimeString += `${days} д. `;
    if (hours > 0) uptimeString += `${hours} ч. `;
    if (minutes > 0) uptimeString += `${minutes} мин. `;
    if (seconds > 0) uptimeString += `${seconds} сек.`;
  
    return uptimeString.trim();
  }

  registerCommand(bot, 'info','Показывает информацию о боте.', async (ctx) => {
  try {
    // Получаем информацию о самом боте
    const botInfo = await bot.telegram.getMe();
    const botName = botInfo.first_name;
    const botUsername = botInfo.username;

    // Получаем время работы бота
    const uptime = formatUptime(process.uptime());

    // Получаем информацию о системе
    const systemInfo = {
      osType: os.type(),  // Тип ОС (например, 'Linux', 'Darwin' для macOS, 'Windows_NT' для Windows)
      osPlatform: os.platform(),  // Платформа ОС (например, 'linux', 'win32', 'darwin' и т.д.)
      osArch: os.arch(),  // Архитектура процессора (например, 'x64', 'arm')
      osRelease: os.release(),  // Версия ОС (например, '5.4.0-42-generic')
      nodeVersion: process.version,  // Версия Node.js (например, 'v16.13.0')
    };

    // Формируем сообщение для отправки
    const infoMessage = `
<b>Название бота</b>: ${botName} (@${botUsername})
<b>Версия</b>: ${config.version}
<b>Авторы</b>: ${config.authors.join(', ')}
<b>Сайт</b>: https://ifydev.ru/
<b>Время работы</b>: ${uptime}
<b>Версия Node.js</b>: ${systemInfo.nodeVersion}
<b>Операционная система</b>: ${systemInfo.osType} (${systemInfo.osPlatform})
<b>Версия ОС</b>: ${systemInfo.osRelease}
<b>Архитектура</b>: ${systemInfo.osArch}
`;

    // Отправляем сообщение с информацией
    await ctx.replyWithHTML(infoMessage, { reply_to_message_id: ctx.message.message_id });

  } catch (error) {
    console.error('Ошибка при получении информации о боте:', error);
    ctx.reply('Ошибка при получении информации о боте.', { reply_to_message_id: ctx.message.message_id });
  }
});
};