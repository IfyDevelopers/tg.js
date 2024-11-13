
function Random(sentences) {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    return sentences[randomIndex];
}
module.exports = Random;