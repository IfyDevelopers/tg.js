const { Telegraf } = require('telegraf')
const https = require('https');
require('dotenv').config();
const config = require('./config');
//const formatUptime = require('./modules/formatUptime.js')

const bot = new Telegraf(process.env.TOKEN)

//сделай обработчик ошибки который не пропускает ошибку в консоль и сохраняет её в файл error.log
bot.catch((err, ctx) => {
    console.error('error', err)
    ctx.reply('Произошла ошибка', { reply_to_message_id: ctx.message.message_id });
}) 


bot.start((ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))
bot.hears('hi', (ctx) => ctx.reply('Hey there', { reply_to_message_id: ctx.message.message_id }))
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
bot.command('info', async (ctx) => {
    try {
      // Получаем информацию о самом боте
      const botInfo = await bot.telegram.getMe();
      const botName = botInfo.first_name; 
      const botUsername = botInfo.username; 
      

      const uptime = formatUptime(process.uptime());
  

      const infoMessage = `
<b>Название бота</b>: ${botName} (@${botUsername})
<b>Версия</b>: ${config.version}
<b>Авторы</b>: ${config.authors.join(', ')}
<b>Сайт: https://ifydev.ru/</b>
<b>Время работы</b>: ${uptime}
`;
      

      ctx.replyWithHTML(infoMessage, { reply_to_message_id: ctx.message.message_id });
    } catch (error) {
      console.error('Ошибка при получении информации о боте:', error);
      ctx.reply('Ошибка при получении информации о боте.', { reply_to_message_id: ctx.message.message_id });
    }
  });

bot.command('avatar', async (ctx) => {
    let userId;
    let userName;

    // Приоритет: если бот отвечает на сообщение, используем его автора
    if (ctx.message.reply_to_message) {
        userId = ctx.message.reply_to_message.from.id;
        userName = ctx.message.reply_to_message.from.username || ctx.message.reply_to_message.from.first_name;
    }
    // Если есть упомянутый пользователь (через @username), получаем ID пользователя
    else if (ctx.message.entities) {
        const mention = ctx.message.entities.find(entity => entity.type === 'mention');
        if (mention) {
            const mentionedUsername = ctx.message.text.slice(mention.offset + 1, mention.offset + mention.length);
            const user = await ctx.telegram.getChatMember(ctx.chat.id, `@${mentionedUsername}`);
            if (user) {
                userId = user.user.id;
                userName = user.user.username || user.user.first_name;
            }
        }
    }
    
    // Если ни ответ на сообщение, ни упоминание не найдены, используем ID автора команды
    if (!userId) {
        userId = ctx.from.id;
        userName = ctx.from.username || ctx.from.first_name;
    }

    try {
        // Получаем аватар пользователя
        const photos = await ctx.telegram.getUserProfilePhotos(userId);

        if (photos.total_count > 0) {
            // Отправляем первое фото профиля
            await ctx.replyWithPhoto(photos.photos[0][0].file_id, {
                caption: `Аватар пользователя ${userName}`
            });
        } else {
            // Если аватара нет
            ctx.reply(`У пользователя ${userName} нет аватара.`);
        }
    } catch (error) {
        console.error("Ошибка при получении аватара:", error);
        ctx.reply(`Не удалось получить аватар пользователя ${userName}.`);
    }
});


// Команда для генерации случайного числа в диапазоне
bot.command('random', (ctx) => {
    // Получаем аргументы из команды
    const args = ctx.message.text.split(' ').slice(1); // Разбиваем текст сообщения на массив и убираем команду
  
    // Если аргументов больше или равно 2
    if (args.length === 2) {
      const [min, max] = args.map(Number); // Преобразуем в числа
  
      if (isNaN(min) || isNaN(max)) {
        return ctx.reply('Пожалуйста, укажите два числа в формате: /random {x} {y}', { reply_to_message_id: ctx.message.message_id });
      }
  
      // Проверяем, чтобы min было меньше max
      if (min >= max) {
        return ctx.reply('Число x должно быть меньше y.', { reply_to_message_id: ctx.message.message_id });
      }
  
      // Генерируем случайное число в указанном диапазоне
      const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
      ctx.replyWithHTML(`Случайное число от <b>${min}</b> до <b>${max}</b> показало <b>${randomNumber}</b>`, { reply_to_message_id: ctx.message.message_id });
    } else {
      ctx.reply('Пожалуйста, укажите два числа в формате: /random {x}{y}', { reply_to_message_id: ctx.message.message_id });
    }
  });

bot.command('help', (ctx) => {
    ctx.replyWithHTML(`
<b>Список команд:</b>
    /start - приветствие
    /help - список команд
    /avatar - отправка аватара
    /random {x} {y} - генерация случайного числа
    /info - информация о боте
<b>Активация сообщением:</b>
    hi - приветствие
<b>Администрация бота:</b>
    /sendnews -({image link})(опционально) {text} - рассылка сообщений в телеграмм и дискорд канал
    `, { reply_to_message_id: ctx.message.message_id });
});

const channelId = '@ifydevnews';
const discordWebhookUrl = 'https://discord.com/api/webhooks/1306859560966950942/WkhfJN14_PU3tZrWJnPkkcYwdbstF9FgY3j0Iz6l4L4X3jz95xFIGHPIrA1sBvsKdoVi';
const authorizedUserId = 1084019563;

// Функция для отправки изображения на Discord с текстом
function sendImageToDiscord(imageUrl, textMessage, ctx) {
    const postData = JSON.stringify({
      content: textMessage, // Добавляем текст
      embeds: [{
        image: {
          url: imageUrl
        }
      }]
    });
  
    const url = new URL(discordWebhookUrl);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
  
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
  
      res.on('end', () => {
        console.log('Ответ от Discord:', data);
        ctx.reply('Изображение и текст успешно отправлены в канал и на Discord.');
      });
    });
  
    req.on('error', (error) => {
      console.error('Ошибка при отправке в Discord:', error);
      ctx.reply('Ошибка при отправке изображения на Discord.');
    });
  
    req.write(postData);
    req.end();
  }
  
  // Команда для отправки сообщений
  bot.command('sendnews', (ctx) => {
    // Проверяем, авторизован ли пользователь
    if (ctx.from.id !== authorizedUserId) {
      return ctx.reply('У вас нет доступа к этой команде.');
    }
  
    // Извлекаем текст из команды
    const messageText = ctx.message.text.slice(12).trim(); // Оставляем только текст после "/sendmessage "
    
    // Проверка на формат ссылки и текста
    const linkRegex = /-\((https?:\/\/[^\s]+)\)/;  // Регулярное выражение для ссылки внутри "-()"
    const match = messageText.match(linkRegex);
    
    if (!match) {
      return ctx.reply('Ошибка: Пожалуйста, дополните команду изображением или сообщением в формуте /sendnews -({ссылка}) или /sendnews -({ссылка}) <текст> или /sendnews {текст}');
    }
  
    // Извлекаем ссылку на картинку и текст
    const imageUrl = match[1];
    const textMessage = messageText.replace(linkRegex, '').trim();  // Убираем ссылку, оставляем текст
  
    if (!textMessage) {
      return ctx.reply('Ошибка: Пожалуйста, добавьте текст сообщения после ссылки на картинку.');
    }
  
    // 1. Отправляем картинку в Telegram-канал с текстом
    bot.telegram.sendPhoto(channelId, imageUrl, { caption: textMessage })
      .then(() => {
        console.log('Изображение успешно отправлено в Telegram');
  
        // 2. Отправляем картинку и текст на Discord через вебхук
        sendImageToDiscord(imageUrl, textMessage, ctx);
      })
      .catch((error) => {
        console.error('Ошибка при отправке изображения в Telegram:', error);
        ctx.reply('Ошибка при отправке изображения в Telegram.');
      });
  });



bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))