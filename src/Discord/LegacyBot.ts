import Discord from "discord.io";
import { DiscordToken } from "../Environment";
import { hasSpoilerImage, isNull } from "../Helper";
import ImageListener from "../ImageListener/ImageProcessor";
import ImageProcessor from "../ImageListener/TensorFlow";
import { LogError, StartUpLog } from "../Logger";
import { Attachment } from "../Types/Attachment";
import { BaseDiscordBot } from "./BaseDiscordBot";
import { IDiscordBot } from "./Interfaces/IDiscordBot";

export default class LegacyDiscordBot extends BaseDiscordBot implements IDiscordBot {


    constructor() {
        super();
    }

    public async Start(): Promise<void> {
        const bot = new Discord.Client({
            token: DiscordToken,
            autorun: true
        });

        bot.on("ready", () => {
            StartUpLog("Legacy Discord Bot is online!");
        });

        bot.on("message", async (_unusedParam, userId, channelId, _unusedParam2, evt) => {
            try {
                const attachment = LegacyDiscordBot.GetAttachment(evt.d);
        
                if (isNull(attachment)){
                    return;
                }
        
                if (hasSpoilerImage(attachment.filename)){
                    bot.sendMessage({
                        to: channelId,
                        message: "I have detected a spoiler image. I will scan this for an attempted burgering"
                    });

                    const searchWords = [ "burger" ];
                    const imageListener = new ImageListener(searchWords, new ImageProcessor(), bot);
                    await imageListener.ProcessImage(attachment, channelId, userId);
                }
            } catch (err){
                LogError(err);
                bot.sendMessage({
                    to: channelId,
                    message: "Something happened. I couldn't check this for a burger :/"
                });
            }
        });
    }

    static GetAttachment(attachments: any): Attachment {
        return attachments.attachments[0];
    }    
}