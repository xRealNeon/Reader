const path = require('path');
const fs = require('fs');
const {
    TesseractWorker
} = require('tesseract.js');
const tessWorker = new TesseractWorker();

var config = {
    "tesseractlang": "deu",
    "ttslang": "de"
};

if (process.platform == 'win32') {
    process.title = "Reader";
} else {
    process.stdout.write('\x1b]2;Reader\x1b\x5c');
}


if (fs.existsSync("config.json")) {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
} else {
    fs.writeFileSync(path.join(__dirname, 'config.json'), JSON.stringify(config));
    console.log("Config created put your images in the /images folder");
}

const gtts = require('node-gtts')(config.ttslang);

if (!fs.existsSync("images")) {
    fs.mkdirSync("images");
}

if (!fs.existsSync("output")) {
    fs.mkdirSync("output");
}

fs.readdir(path.join(__dirname, '/images/'), function (err, files) {
    files.forEach(function (file) {
        if (!file.includes(".gitkeep")) {
            recognize(file);
        }
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