import { Attachment } from "./types/Attachment";
import { ImageCache } from "./types/ImageCache";
import * as Discord from "discord.io";
import * as logger from "winston";
import * as auth from "./auth.json";
import * as mobilenet from "@tensorflow-models/mobilenet";
import axios from "axios";
import * as fs from "fs";
import * as tf from "@tensorflow/tfjs-node";

require(`dotenv`).config();

// We need to start a web server for heroku
startServer();




const commandTrigger = `!`;
var searchWords = [ `burger` ];
const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
var imageCache: ImageCache[] = [];

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console);

// logger.level = 'debug';

// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', async function (user, userID, channelID, message, evt) {
    try {
        logger.info('Has Message from { ' + user + ' } { ' + userID + ' }');
        // logger.info(message);
        // logger.info(evt);

        // listen for commands
        if (hasComamnd(message)){
            var command = getCommand(message);
            switch(command) {
                case 'ping':
                    bot.sendMessage({
                        to: channelID,
                        message: 'Pong!'
                    });
                    break;
                case `checklastspoiler`:
                    logger.info(imageCache);
                    var lastSentSpoiler = imageCache.pop();
                    
                    if (isNull(lastSentSpoiler)){
                        bot.sendMessage({to: channelID, message: `I have not seen a spoiler image recently.`});
                        return;
                    }

                    var cachedAttachment: Attachment = {
                        url: lastSentSpoiler.FileName,
                        content_type: `image/png`,
                        filename: lastSentSpoiler.FileName,
                        height: 0,
                        id: null,
                        width: 0,
                        proxy_url: null,
                        size: 0
                    };
                    checkSpoiler(cachedAttachment, bot, channelID, userID, `I will check the last spoiler image that I can see for a burger`, false);
                    break;
                case `help`:
                    bot.sendMessage({to: channelID, message: 
                    `Send messages with the ${commandTrigger} character. 
                    ${commandTrigger}help : this command
                    ${commandTrigger}checklastspoiler : Checks the last spoiler image that I have received
                    `});
                    break;
                // Just add any case commands if you want to..
            }
        }

        var attachment = getAttachment(evt.d);

        if (isNull(attachment)){
            return;
        }

        if (hasSpoilerImage(attachment.filename)){
            checkSpoiler(attachment, bot, channelID, userID, "I have detected a spoiler image. I will scan this for an attempted burgering");
        }
    } catch (err){
        logger.error(err);
        bot.sendMessage({to: channelID, message: "Something happened. I couldn't check this for a burger :/"})
    }
});

async function checkSpoiler(attachment: Attachment, bot, channel: string, userID: string, message: string, downloadImage: boolean = true) {
    bot.sendMessage({to: channel, message});
    await processImage(attachment, bot, channel, `<@${userID}>`, downloadImage);
}

async function processImage(imageAttachment: Attachment, bot, channel: string, userName: string, downloadImage: boolean) {
    var imageType = imageAttachment.content_type;
    var imageUrl = imageAttachment.url;
    
    if (!acceptedImageTypes.includes(imageType)) {
        throw new Error("Image type not supported");
    }

    var imageName = Date.now().toString();
    var imageDir = `images/`;

    if (downloadImage){ 
        imageName = `${imageName}.${getFileExtension(imageUrl)}`;
        await downloadImageFromUrl(imageDir, imageUrl, imageName).catch((err) => {throw err});
    } else {
        imageName = imageAttachment.filename;
        imageDir = ``; // image dir is defined in the cache
    }
    await getDownloadedImage(imageDir, imageUrl, imageName, bot, channel, userName, downloadImage).catch((err) => {throw err});
}

async function getDownloadedImage(imageDir: string, url: string, imageName: string, bot, channel: string, userName: string, saveToCache: boolean) {
    var imageNameWithDir = `${imageDir}${imageName}`;
    return fs.readFile(imageNameWithDir, async function(err, data) {
        if (err) throw err; // Fail if the file can't be read.
        
        if (saveToCache) {
            imageCache.push(
                {
                    FileName: imageNameWithDir,
                    Timestamp: Date.now(),
                    ExpiresIn: 3600
                }
            );
        }

        var imageBuffer = data;
        var image = tf.node.decodeImage(imageBuffer);

        const predictions = await classify(image).catch((err) => {throw err});
        
        logger.info(predictions);

        if (!isNull(predictions)){
            var found = false;
            predictions.forEach((prediction) => {
                searchWords.forEach((word) => {
                    if (prediction.className.includes(word)) {
                        if (!found){
                            found = true;
                            bot.sendMessage({to: channel, message: `I have analysed the last spoiler sent. This is a burger. For your safety do not click, or you will be burgered. ${userName} shame on you!`});
                        }
                    }
                });
            });

            if (!found) {
                bot.sendMessage({to: channel, message: `I have analzed the last spoiler sent. I don’t think it has a burger in it.`})
            }
        }
    });
}

async function classify(image: any){
    const model = await mobilenet.load().catch((err) => {throw err});
    const predictions = await model.classify(image).catch((err) => {throw err});
    return predictions;
}

async function downloadImageFromUrl(imageDir: string, url: string, filename: string){
    var filepath = `${imageDir}${filename}`;
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}

function getFileExtension(url: string){
    return url.split('.').pop();
}

function getImageUrl(attachment: Attachment){
    if (isNull(attachment)){
        throw new Error("No Attachment Provided");
    }
    return attachment.url;
}

function isNull(attachment: any){
    return attachment === undefined || attachment === null;
}

function hasSpoilerImage(fileName: any){
    return fileName.includes("SPOILER");
}

function getAttachment(attachments: any): Attachment {
    return attachments.attachments[0];
}

function hasComamnd(message: string){
    return message.substring(0, 1) == commandTrigger;
}

function getCommand(message: string){
    var args = message.substring(1).split(' ');
    return args[0];
}

function startServer(){
    var http = require('http');

    var host = process.env.host;

    if (isNull(host)){
        throw new Error(`Host cannot be null`);
    }

    console.log(process.env.NODE_ENV);
    
    const hostname = host;
    const port = process.env.port || 3000;
    
    logger.info(`listening on port ${port}`)

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write('Hello World!');
        res.end();
      }).listen(port);
}