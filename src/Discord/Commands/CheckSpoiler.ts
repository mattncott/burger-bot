import { Attachment, ChatInputCommandInteraction, Collection, Message, userMention } from "discord.js";
import IDatabase from "../../Data/Interfaces/IDatabase";
import IUserWallet from "../../Data/Interfaces/IUserWallet";
import BaseCommand from "./BaseCommand";
import ICommand from "./interfaces/ICommand";
import ImageListener  from "../../ImageListener/ImageProcessor";
import ImageProcessor from "../../ImageListener/TensorFlow";

export default class CheckSpoiler extends BaseCommand implements ICommand{

    private _interaction: ChatInputCommandInteraction;
    private _imageProcessor: ImageListener;

    constructor(interaction: ChatInputCommandInteraction, database?: IDatabase, userWallet?: IUserWallet)
    {
        super(database, userWallet);

        this._interaction = interaction;
        const predictions = [ "burger" ]
        this._imageProcessor = new ImageListener(predictions, new ImageProcessor(), this._interaction)
    }

    public async HandleCommand()
    {
        const sendingUser = this._interaction.user;
        const messageid = this._interaction.options.getString('messageid')

        if (messageid == null) {
            this._interaction.reply({
                content: `No message found with this Id. Please try again`,
                ephemeral: true
            });
            return;
        }
        const message = await this._interaction.channel?.messages.fetch(messageid)
        const spoilerAttachments = this.GetSpoilerAttachments(message)

        if (spoilerAttachments?.first() == null) {
            this._interaction.reply({
                content: `The message of this ID does not contain a spoiler. No need to check it`,
                ephemeral: true
            });
        } else {
            this._interaction.reply({
                content: `${userMention(sendingUser.id)} is checking a Spoiler Image....`,
            });

            spoilerAttachments.forEach((attachment: Attachment) => {
                this._imageProcessor.ProcessImage(attachment);
            })
        }
    }

    private GetSpoilerAttachments(message: Message<boolean> | undefined): Collection<string, Attachment> | null {
        if (message == null) {
            return null
        }

        return message.attachments.filter((attachment: Attachment) => attachment.spoiler)
    }
}

