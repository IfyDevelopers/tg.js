require('dotenv').config();
const config = require('../config'); 
const process = require('process'); 
const axios = require('axios'); 
module.exports = (bot) => {
    const channelId = config.newschannel
    const discordWebhookUrl = process.env.WEBHOOK;
    async function sendMessageToDiscord(textMessage, imageUrl) {
      try {
        // Создаем данные для запроса
        const postData = {
          content: textMessage, // Текстовое сообщение
        };
    
        // Если есть картинка, добавляем её в embeds
        if (imageUrl) {
          postData.embeds = [
            {
              image: {
                url: imageUrl, // Ссылка на картинку
              },
            },
          ];
        }
      
        // Убедимся, что URL для вебхука правильный
        const url = discordWebhookUrl;  // Webhook URL, который ты должен подставить
        const res = await axios.post(url, postData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        // Если статус ответа 204, значит запрос прошел успешно
        if (res.status === 204) {
        } else {
          throw new Error(`Ошибка при отправке сообщения в Discord. Статус: ${res.status}`);
        }
      } catch (error) {
        throw new Error('Ошибка при отправке сообщения в Discord.');
      }
    }
    
    // Команда для отправки сообщений с картинкой и текстом
    bot.command('sendnews', async (ctx) => {
      // Проверяем, авторизован ли пользователь
      if (!config.ownersid.includes(ctx.from.id)) {
        return ctx.reply('У вас нет доступа к этой команде.');
      }
    
      // Извлекаем текст из команды
      const messageText = ctx.message.text.slice(9).trim(); // Оставляем только текст после "/sendnews "
    
      // Проверяем, если текст пустой, то просим пользователя добавить текст или картинку
      if (!messageText) {
        return ctx.reply('Ошибка: Пожалуйста, добавьте текст или ссылку на картинку после команды /sendnews.');
      }
    
      // Регулярное выражение для ссылки на картинку в формате -(<ссылка>)
      const linkRegex = /-\((https?:\/\/[^\s]+)\)/;
      const match = messageText.match(linkRegex);
    
      try {
        let imageUrl = '';
        let textMessage = messageText;
    
        // Если есть ссылка на картинку, извлекаем её
        if (match) {
          imageUrl = match[1];
          textMessage = messageText.replace(linkRegex, '').trim();  // Убираем ссылку, оставляем текст
    
          if (!textMessage) {
            return ctx.reply('Ошибка: Пожалуйста, добавьте текст сообщения после ссылки на картинку.');
          }
        }
    
        // 1. Если есть картинка, отправляем её с текстом в Telegram
        if (imageUrl) {
          if (textMessage) { // Проверка, что текст не пустой
            await bot.telegram.sendPhoto(channelId, imageUrl, { caption: textMessage });
          } else {
            return ctx.reply('Ошибка: Текст сообщения не может быть пустым.');
          }
        } else {
          // Если картинки нет, отправляем только текст, но проверяем, что текст не пустой
          if (textMessage) {
            await bot.telegram.sendMessage(channelId, textMessage);
          } else {
            return ctx.reply('Ошибка: Текст сообщения не может быть пустым.');
          }
        }
    
        // 2. Отправляем сообщение на Discord с картинкой (если есть)
        if (textMessage) { // Проверка, что текст не пустой
          await sendMessageToDiscord(textMessage, imageUrl);
        } else {
          return ctx.reply('Ошибка: Текст сообщения не может быть пустым.');
        }
    
        // 3. Ответ пользователю после успешной отправки в оба канала
        ctx.reply('Сообщение успешно отправлено в Telegram и Discord.');
      } catch (error) {
        console.error('Ошибка:', error);
        ctx.reply('Произошла ошибка при отправке сообщения в Telegram или Discord.');
      }
    });
}