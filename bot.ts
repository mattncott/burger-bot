import { Attachment } from "./types/Attachment";
import * as Discord from "discord.io";
import * as logger from "winston";
import * as auth from "./auth.json";
import * as mobilenet from "@tensorflow-models/mobilenet";
import axios from "axios";
import * as fs from "fs";
import * as tf from "@tensorflow/tfjs-node";

var searchWords = [ `burger` ];
const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];

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
                // Just add any case commands if you want to..
            }
        }

        var attachment = getAttachment(evt.d);

        if (isNull(attachment)){
            return;
        }

        if (hasSpoilerImage(attachment.filename)){
            bot.sendMessage({to: channelID, message: "I have detected a spoiler image. I will scan this for an attempted burgering"});
            await processImage(attachment, bot, channelID, `<@${userID}>`);
        }
    } catch (err){
        logger.error(err);
        bot.sendMessage({to: channelID, message: "Something happened. I couldn't check this for a burger :/"})
    }
});

export async function processImage(imageAttachment: Attachment, bot, channel: string, userName: string) {
    var imageType = imageAttachment.content_type;
    var imageUrl = imageAttachment.url;
    
    if (!acceptedImageTypes.includes(imageType)) {
        throw new Error("Image type not supported");
    }

    var timestamp = Date.now();

    await downloadImageFromUrl(imageUrl, timestamp.toString()).catch((err) => {throw err});
    await getDownloadedImage(imageUrl, timestamp.toString(), bot, channel, userName).catch((err) => {throw err});
}

async function getDownloadedImage(url: string, imageName: string, bot, channel: string, userName: string) {
    return fs.readFile(`images/${imageName}.${getFileExtension(url)}`, async function(err, data) {
        if (err) throw err; // Fail if the file can't be read.
        
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

async function downloadImageFromUrl(url: string, filename: string){
    var filepath = `images/${filename}.${getFileExtension(url)}`;
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
    return message.substring(0, 1) == '!';
}

function getCommand(message: string){
    var args = message.substring(1).split(' ');
    return args[0];
}