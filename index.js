const path = require('path');
const fs = require('fs');
const {
    TesseractWorker
} = require('tesseract.js');
const tessWorker = new TesseractWorker();

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));

const gtts = require('node-gtts')(config.ttslang);

fs.readdir(path.join(__dirname, '/images/'), function (err, files) {
    files.forEach(function (file) {
        recognize(file);
    });
});

function recognize(image) {
    tessWorker.recognize(path.join(__dirname, '/images/' + image), config.tesseractlang)
        .progress((info) => {
            writeLine(`Recognizing ${image} ` + (info.progress * 100).toFixed(2) + '%');
        })
        .then((data) => {
            console.log();
            fs.writeFileSync(path.join(__dirname, '/output/' + image + ".txt"), data.text);
            gtts.save(path.join(__dirname, '/output/' + image + ".wav"), data.text, function () {
                console.log('save done!');
            });
        })
        .catch((err) => {
            console.log('Error\n', err);
        })
}

function writeLine(text) {
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(text);
}