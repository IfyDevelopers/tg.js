require('dotenv').config();
const config = require('../config');
const process = require('process'); 
const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


require('dotenv').config();
const { registerCommand, registerTextCommand, getCommands, getTextCommands } = require('../modules/commandHelper');
module.exports = (bot) => {
    // Убедимся, что папка для сообщений существует
    const parentDir = path.join(__dirname, '..');

    // Путь к новой папке 'messages' в родительской директории
    const messagesDir = path.join(parentDir, 'messages');
    
    // Проверяем, существует ли папка
    if (!fs.existsSync(messagesDir)) {
      // Если папки нет, создаем ее
      fs.mkdirSync(messagesDir);
    }

    // Обработчик команды /ask
    registerCommand(bot, 'ask', 'Задает запрос искусственному интеллекту.', async (ctx) => {
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
    registerCommand(bot, 'model', 'Сменить модель искусственного интеллекта.', async (ctx) => {
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
        ? 'Модель для общения.' 
        : 'Модель для умных запросов.';

        ctx.reply(`Модель была изменена на: ${newModel}\n${modelDescription}`, { reply_to_message_id: ctx.message.message_id });
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
    registerCommand(bot, 'reset', 'Сбросить историю запросов искусственного интеллекта.', async (ctx) => {
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

        ctx.reply('Ваша история сообщений была очищена, но модель сохранена.', { reply_to_message_id: ctx.message.message_id });
    } else {
        ctx.reply('Ваша история сообщений уже пуста.', { reply_to_message_id: ctx.message.message_id });
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
};