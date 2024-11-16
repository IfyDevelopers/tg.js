const { Telegraf } = require('telegraf')
const https = require('https');
require('dotenv').config();
const config = require('./config');
//const formatUptime = require('./modules/formatUptime.js')

const bot = new Telegraf(process.env.TOKEN)


bot.catch((err, ctx) => {
    console.error('error', err)
    ctx.reply('Произошла ошибка', { reply_to_message_id: ctx.message.message_id });
}) 


bot.start((ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))
bot.hears('hi', (ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))
// Обработчик, когда встречается слово "бу"
bot.hears(/бу/, (ctx) => {
  const messageText = ctx.message.text;

  // Ищем упоминание пользователя в сообщении
  const pingPattern = /@([a-zA-Z0-9_]+)|https:\/\/t\.me\/([a-zA-Z0-9_]+)/;
  const match = messageText.match(pingPattern);

  // Если найдено упоминание пользователя, пингуем его в ответе
  if (match) {
    const username = match[1] || match[2]; // Получаем username
    const userMention = `@${username}`;

    // Отправляем ответ с пингом пользователя
    ctx.reply(`${userMention}, Бу! Испугался? Не бойся, я друг, я тебя не обижу. Иди сюда, иди ко мне, сядь рядом со мной, посмотри мне в глаза. Ты видишь меня? Я тоже тебя вижу. Давай смотреть друг на друга до тех пор, пока наши глаза не устанут. Ты не хочешь? Почему? Что-то не так?`, {
      reply_to_message_id: ctx.message.message_id
    });
  } else if (ctx.message.reply_to_message) {
    // Если пинга нет, просто отвечаем на слово "бу"
    const userMention = ctx.message.reply_to_message.from.username || ctx.message.reply_to_message.from.first_name;
    ctx.reply(`@${userMention}, Бу! Испугался? Не бойся, я друг, я тебя не обижу. Иди сюда, иди ко мне, сядь рядом со мной, посмотри мне в глаза. Ты видишь меня? Я тоже тебя вижу. Давай смотреть друг на друга до тех пор, пока наши глаза не устанут. Ты не хочешь? Почему? Что-то не так?`, {
      reply_to_message_id: ctx.message.message_id
    });
  } else {
    ctx.reply(`Бу! Испугался? Не бойся, я друг, я тебя не обижу. Иди сюда, иди ко мне, сядь рядом со мной, посмотри мне в глаза. Ты видишь меня? Я тоже тебя вижу. Давай смотреть друг на друга до тех пор, пока наши глаза не устанут. Ты не хочешь? Почему? Что-то не так?`, {
      reply_to_message_id: ctx.message.message_id
    });
  }
});


  
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
        // Ищем все упоминания и обрабатываем их
        const mentions = ctx.message.entities.filter(entity => entity.type === 'mention');
        if (mentions.length > 0) {
            const mentionedUsername = ctx.message.text.slice(mentions[0].offset + 1, mentions[0].offset + mentions[0].length);
            try {
                const user = await ctx.telegram.getChatMember(ctx.chat.id, `@${mentionedUsername}`);
                if (user) {
                    userId = user.user.id;
                    userName = user.user.username || user.user.first_name;
                }
            } catch (error) {
                console.error("Ошибка при получении пользователя по упоминанию:", error);
                return ctx.reply(`Не удалось найти пользователя с именем @${mentionedUsername}.`, { reply_to_message_id: ctx.message.message_id });
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
            ctx.reply(`У пользователя ${userName} нет аватара.`, { reply_to_message_id: ctx.message.message_id });
        }
    } catch (error) {
        console.error("Ошибка при получении аватара:", error);
        ctx.reply(`Не удалось получить аватар пользователя ${userName}.`, { reply_to_message_id: ctx.message.message_id });
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
    бу - испугался?
<b>Администрация бота:</b>
    /sendnews -({image link})(опционально) {text} - рассылка сообщений в телеграмм и дискорд канал
    `, { reply_to_message_id: ctx.message.message_id });
});




const channelId = '@ifydevnews';
const discordWebhookUrl = 'https://discord.com/api/webhooks/1306859560966950942/WkhfJN14_PU3tZrWJnPkkcYwdbstF9FgY3j0Iz6l4L4X3jz95xFIGHPIrA1sBvsKdoVi';

const axios = require('axios');

// Функция для отправки сообщения на Discord
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
      throw new Error(`Ошибка при отправке сообщения на Discord. Статус: ${res.status}`);
    }
  } catch (error) {
    throw new Error('Ошибка при отправке сообщения на Discord.');
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
    ctx.reply('Сообщение успешно отправлено в Telegram и на Discord.');
  } catch (error) {
    console.error('Ошибка:', error);
    ctx.reply('Произошла ошибка при отправке сообщения в Telegram или Discord.');
  }
});
bot.launch()
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))