const { registerCommand, registerTextCommand, getCommands, getTextCommands } = require('../modules/commandHelper');
module.exports = (bot) => {
    registerCommand(bot, 'boo', 'Испугался?', async (ctx) => {  // Реагирует только на команду "/бу"
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
    registerTextCommand(bot, /^бу(\s|$)/,'бу', 'Испугался?', async (ctx) => { 
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
};