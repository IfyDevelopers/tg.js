const { registerCommand, registerTextCommand, getCommands, getTextCommands } = require('../modules/commandHelper');
module.exports = (bot) => {
    // Команда для генерации случайного числа в диапазоне
    registerCommand(bot, 'random', 'Сгенерирует случайное число в указанном диапазоне.', async (ctx) => {
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
};