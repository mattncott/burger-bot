import { Attachment } from "../../types/Attachment";
import * as Discord from "discord.io";
import * as logger from "winston";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as tf from "@tensorflow/tfjs-node";
import { hasSpoilerImage, isNull } from "../Helper";
import jimp from 'jimp';
import { DiscordToken } from "../../BurgerBotStart";

const searchWords = [ `burger` ];
const acceptedImageTypes = ['image/jpeg', 'image/png'];

export async function ListenForImages(){
    var bot = new Discord.Client({
        token: DiscordToken,
        autorun: true
    });
    
    bot.on('message', async function (user, userID, channelID, message, evt) {
        try {
            var attachment = getAttachment(evt.d);
    
            if (isNull(attachment)){
                return;
            }
    
            if (hasSpoilerImage(attachment.filename)){
                checkSpoiler(attachment, bot, channelID, userID, "I have detected a spoiler image. I will scan this for an attempted burgering").catch((err) => { console.log(err) });
            }
        } catch (err){
            logger.error(err);
            bot.sendMessage({to: channelID, message: "Something happened. I couldn't check this for a burger :/"})
        }
    });
}

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

    await getDownloadedImage(imageDir, imageUrl, imageName, bot, channel, userName, imageType);
}

async function getDownloadedImage(imageDir: string, url: string, imageName: string, bot, channel: string, userName: string, imageType: string) {
    var imageNameWithDir = `${imageDir}${imageName}`;
    var image = await jimp.read(url);
    // await image.resize(331, 454, jimp.RESIZE_BILINEAR);

    var savedFileName = `${imageNameWithDir}.jpg`
    await image.writeAsync(savedFileName);
    var imageBuffer = await (await jimp.read(savedFileName)).getBufferAsync(imageType);

    try {

        var tfImage = tf.node.decodeImage(imageBuffer);
        var tfImageResized = tf.image.resizeBilinear(tfImage, [331, 454], true, false);
        const predictions = await classify(tfImageResized).catch((err) => {throw err});
        
        if (!isNull(predictions)){
            var found = false;
            console.log(predictions);
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
                bot.sendMessage({to: channel, message: `I have analzed the last spoiler sent. I don't think it has a burger in it.`})
            }
        }
    } catch (error) {
        console.log(error);

        if (error.message.includes("but the requested shape requires a multiple of")) {
            bot.sendMessage({to: channel, message: `Image resolution is too high. I can't check this :/`})
        } else {
            bot.sendMessage({to: channel, message: `Something happened and I can't analyse this.`})
        }

    }
}

async function classify(image: any){
    const model = await mobilenet.load().catch((err) => {throw err});
    const predictions = await model.classify(image, 3).catch((err) => {throw err});
    return predictions;
}

function getAttachment(attachments: any): Attachment {
    return attachments.attachments[0];
}