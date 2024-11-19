let commands = [];
let textCommands = [];

function registerCommand(bot, command, description, handler) {
    bot.command(command, handler);
    commands.push({ command, description: description || 'None' });
}

function registerTextCommand(bot, text, displayName, description, handler) {
    let displayText = text instanceof RegExp ? text.source : text;
    let displayNameToShow = displayName || displayText; // Если displayName не передан, показываем сам текст команды

    bot.hears(text, handler);
    textCommands.push({
        text: displayText,
        displayName: displayNameToShow,
        description: description || 'None'
    });
}

function getCommands() {
    return commands;
}

function getTextCommands() {
    return textCommands;
}

module.exports = { registerCommand, registerTextCommand, getCommands, getTextCommands };
