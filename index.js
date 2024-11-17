const { Telegraf } = require('telegraf')
const https = require('https');
require('dotenv').config();
const config = require('./config');
const os = require('os');  
const process = require('process'); 
//const formatUptime = require('./modules/formatUptime.js')
const axios = require('axios'); 
const { performance } = require('perf_hooks'); 
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

const bot = new Telegraf(process.env.TOKEN)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

bot.catch( async (err, ctx) => {
    console.error('error', err)
    ctx.reply('Произошла ошибка', { reply_to_message_id: ctx.message.message_id });
}) 


bot.start(async (ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))
bot.hears('hi', async (ctx) => ctx.reply('Привет, используй команду /help для получения списка команд', { reply_to_message_id: ctx.message.message_id }))
bot.hears(/^бу(\s|$)/, async (ctx) => {  // ^бу и дальше может идти только пробел или конец строки
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
    // Если это ответ на сообщение, пингуем того, кто отправил это сообщение
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
  

bot.command('boo', async (ctx) => {  // Реагирует только на команду "/бу"
  const messageText = ctx.message.text;

  // Ищем упоминание пользователя в сообщении (после команды "/бу")
  const pingPattern = /@([a-zA-Z0-9_]+)/;  // Только проверка на упоминания вида @username
  const match = messageText.match(pingPattern);

  // Если найдено упоминание пользователя, пингуем его
  if (match) {
    const username = match[1];  // Получаем username
    const userMention = `@${username}`;

    // Отправляем ответ с пингом пользователя
    await ctx.reply(`${userMention}, Бу! Испугался? Не бойся, я друг, я тебя не обижу. Иди сюда, иди ко мне, сядь рядом со мной, посмотри мне в глаза. Ты видишь меня? Я тоже тебя вижу. Давай смотреть друг на друга до тех пор, пока наши глаза не устанут. Ты не хочешь? Почему? Что-то не так?`, {
      reply_to_message_id: ctx.message.message_id
    });
  } else if (ctx.message.reply_to_message) {
    // Если это ответ на сообщение, пингуем того, кто отправил это сообщение
    const userMention = ctx.message.reply_to_message.from.username || ctx.message.reply_to_message.from.first_name;
    await ctx.reply(`@${userMention}, Бу! Испугался? Не бойся, я друг, я тебя не обижу. Иди сюда, иди ко мне, сядь рядом со мной, посмотри мне в глаза. Ты видишь меня? Я тоже тебя вижу. Давай смотреть друг на друга до тех пор, пока наши глаза не устанут. Ты не хочешь? Почему? Что-то не так?`, {
      reply_to_message_id: ctx.message.message_id
    });
  } else {
    // Если нет упоминания, просто отвечаем на команду "/бу"
    await ctx.reply(`Бу! Испугался? Не бойся, я друг, я тебя не обижу. Иди сюда, иди ко мне, сядь рядом со мной, посмотри мне в глаза. Ты видишь меня? Я тоже тебя вижу. Давай смотреть друг на друга до тех пор, пока наши глаза не устанут. Ты не хочешь? Почему? Что-то не так?`, {
      reply_to_message_id: ctx.message.message_id
    });
  }
});



// Убедимся, что папка для сообщений существует
const messagesDir = path.join(__dirname, 'messages');
if (!fs.existsSync(messagesDir)) {
  fs.mkdirSync(messagesDir);
}

// Обработчик команды /ask
bot.command('ask', async (ctx) => {
  const userId = String(ctx.from.id);
  const userMessage = ctx.message.text.slice(5).trim(); // Убираем '/ask ' из текста

  if (!userMessage) {
    return ctx.reply('Пожалуйста, укажите запрос после команды /ask.', {
      reply_to_message_id: ctx.message.message_id, // Указываем, на какое сообщение отвечаем
    });
  }

  // Получаем историю сообщений пользователя из файла
  const conversation = await getUserMessages(userId);

  // Проверка на количество сообщений
  if (conversation.length / 2 >= 100) {  // Каждое сообщение пользователя и бота занимает 2 места
    // Если сообщений больше, чем лимит, удаляем пары (пользователь + бот) с конца
    while (conversation.length / 2 >= 100) {
      conversation.shift();  // Удаляем пару сообщений: сначала пользователя, потом бот
      conversation.shift();
    }
  }

  // Добавляем новое сообщение пользователя в историю
  conversation.push({ role: 'user', content: userMessage });

  // Сохраняем обновлённую историю сообщений в файл (не затрагиваем модель)
  await saveUserMessagesWithoutModel(userId, conversation);

  try {
    // Получаем текущую модель для пользователя
    const model = await getUserModel(userId);

    // Отправляем запрос в Groq API с учётом контекста и модели
    const aiResponse = await getGroqChatCompletion(conversation, model);

    // Добавляем ответ бота в историю
    conversation.push({ role: 'assistant', content: aiResponse });

    // Сохраняем обновленную историю сообщений в файл (не затрагиваем модель)
    await saveUserMessagesWithoutModel(userId, conversation);

    // Отправляем ответ пользователю
    ctx.reply(aiResponse, { reply_to_message_id: ctx.message.message_id });
  } catch (error) {
    console.error('Ошибка при получении ответа от Groq:', error);
    ctx.reply('Произошла ошибка при обработке запроса. Попробуйте снова позже.');
  }
});

// Обработчик команды /model (смена модели)
bot.command('model', async (ctx) => {
  const userId = String(ctx.from.id);
  const userFilePath = path.join(messagesDir, `${userId}.js`);

  // Проверяем, существует ли файл с историей сообщений пользователя
  if (fs.existsSync(userFilePath)) {
    // Получаем данные пользователя
    const data = await fs.promises.readFile(userFilePath, 'utf8');
    const userData = JSON.parse(data);

    // Получаем текущую модель пользователя, если она есть
    const currentModel = userData.model || 'llama3-8b-8192';  // По умолчанию используем модель для общения

    // Переключаем модель на противоположную
    const newModel = currentModel === 'llama3-8b-8192' 
      ? 'llama3-groq-70b-8192-tool-use-preview' 
      : 'llama3-8b-8192';

    // Сохраняем новую модель в файл, не трогая историю сообщений
    userData.model = newModel;

    // Сохраняем обновлённую информацию с моделью
    await fs.promises.writeFile(userFilePath, JSON.stringify(userData, null, 2));

    // Ответ пользователю с описанием модели
    const modelDescription = newModel === 'llama3-8b-8192' 
      ? 'Базовая модель — Модель для общения' 
      : 'Вторая модель — Модель для умных запросов';

    ctx.reply(`Модель была изменена на: ${newModel}\n${modelDescription}`);
  } else {
    // Если файла нет, создаем новый с моделью для общения по умолчанию
    const userData = {
      conversation: [],
      model: 'llama3-8b-8192', // Устанавливаем модель для общения по умолчанию
    };

    await fs.promises.writeFile(userFilePath, JSON.stringify(userData, null, 2));

    ctx.reply('Ваш файл истории сообщений был создан, и модель установлена на: Модель для общения.');
  }
});

// Обработчик команды /reset (сброс истории сообщений)
bot.command('reset', async (ctx) => {
  const userId = String(ctx.from.id);
  const userFilePath = path.join(messagesDir, `${userId}.js`);

  // Проверяем, существует ли файл с историей сообщений пользователя
  if (fs.existsSync(userFilePath)) {
    const data = await fs.promises.readFile(userFilePath, 'utf8');
    const userData = JSON.parse(data);

    // Сохраняем только модель и очищаем историю сообщений
    userData.conversation = [];

    // Сохраняем обновлённый файл без истории сообщений
    await fs.promises.writeFile(userFilePath, JSON.stringify(userData, null, 2));

    ctx.reply('Ваша история сообщений была очищена, но модель сохранена.');
  } else {
    ctx.reply('Ваша история сообщений уже пуста.');
  }
});

// Функция для получения сообщений пользователя из файла
async function getUserMessages(userId) {
  const userFilePath = path.join(messagesDir, `${userId}.js`);

  if (fs.existsSync(userFilePath)) {
    const data = await fs.promises.readFile(userFilePath, 'utf8');
    return JSON.parse(data).conversation || [];  // Возвращаем массив сообщений
  }

  // Если файла нет, возвращаем пустой массив
  return [];
}

// Функция для сохранения сообщений пользователя в файл (без изменения модели)
async function saveUserMessagesWithoutModel(userId, conversation) {
  const userFilePath = path.join(messagesDir, `${userId}.js`);

  // Получаем текущую модель из файла
  const userData = await getUserData(userId);
  
  // Сохраняем только историю сообщений, модель не меняем
  const data = { conversation, model: userData.model };
  await fs.promises.writeFile(userFilePath, JSON.stringify(data, null, 2));
}

// Функция для получения данных пользователя (включая модель)
async function getUserData(userId) {
  const userFilePath = path.join(messagesDir, `${userId}.js`);

  if (fs.existsSync(userFilePath)) {
    const data = await fs.promises.readFile(userFilePath, 'utf8');
    return JSON.parse(data);
  }

  return { model: 'llama3-8b-8192', conversation: [] }; // Если файла нет, модель по умолчанию для общения
}

// Функция для получения модели пользователя
async function getUserModel(userId) {
  const userData = await getUserData(userId);
  return userData.model || 'llama3-8b-8192';  // Возвращаем модель, если она есть
}

// Функция для запроса к Groq API с учётом выбранной модели
async function getGroqChatCompletion(conversation, model) {
  try {
    const response = await groq.chat.completions.create({
      messages: conversation,
      model: model, // Используем модель, выбранную пользователем
    });

    return response.choices[0]?.message?.content || 'Ответ не получен.';
  } catch (error) {
    console.error('Ошибка при запросе к Groq:', error);
    return 'Ошибка при запросе к серверу. Попробуйте снова позже.';
  }
}



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
bot.command('random', async (ctx) => {
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

bot.command('help', async (ctx) => {
    ctx.replyWithHTML(`
<b>Список команд:</b>
    /start - приветствие
    /help - список команд
    /ask - отправить запрос ии
    /reset - очистить историю запросов ии
    /avatar - отправка аватара
    /random {x} {y} - генерация случайного числа
    /info - информация о боте
    /boo - испугался?
<b>Активация сообщением:</b>
    hi - приветствие
    бу - испугался?
<b>Администрация бота:</b>
    /sendnews -({image link})(опционально) {text} - рассылка сообщений в телеграмм и дискорд канал
    `, { reply_to_message_id: ctx.message.message_id });
});




const channelId = '@ifydevnews';
const discordWebhookUrl = 'https://discord.com/api/webhooks/1306859560966950942/WkhfJN14_PU3tZrWJnPkkcYwdbstF9FgY3j0Iz6l4L4X3jz95xFIGHPIrA1sBvsKdoVi';


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