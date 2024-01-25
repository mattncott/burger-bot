import { isNull } from "../Helper";
import IImageProcessor from "./Interfaces/ITensorFlow";
import { Tensor3D } from "@tensorflow/tfjs-node";
import { LogError } from "../Logger";
import { ImageType } from "../Types/ImageType";

import * as fs from "fs";
import * as jimp from "jimp";
import { Attachment, ChatInputCommandInteraction } from "discord.js";

export default class ImageProcessor {

    private readonly _predictionsToDetect: string[];
    private readonly _imageProcessor: IImageProcessor;
    private readonly _interaction: ChatInputCommandInteraction;

    private readonly _imageDirectory = "/images/";

    constructor(predictionsToDetect: string[], imageProcessor: IImageProcessor, interaction: ChatInputCommandInteraction)
    {
        this._predictionsToDetect = predictionsToDetect;
        this._imageProcessor = imageProcessor;
        this._interaction = interaction;
    }

    public async ProcessImage(imageAttachment: Attachment): Promise<any> {
        const imageType = imageAttachment.contentType as ImageType;
        const imageUrl = imageAttachment.url;
        
        if (!Object.values(ImageType).includes(imageType)) {
            this._interaction.editReply({
                content: `Image type not supported`
            });
            return;
        }
    
        const imageName = Date.now().toString();
    
        try {
            const image = await this.DownloadAndSaveImage(imageUrl, imageName);
            const imageMatchesPrediction = await this.ClassifyImageAndCheckPredictions(image);
    
            if (imageMatchesPrediction) {
                this._interaction.editReply({
                    content: `I have analysed the last spoiler sent. This is a burger. For your safety do not click, or you will be burgered.`});
            } else {
                this._interaction.editReply({
                    content: `I have analzed the last spoiler sent. I don't think it has a burger in it.`
                });
            }
        } catch (error: any) {
            LogError(error);

            if (error.message.includes("but the requested shape requires a multiple of")) {
                this._interaction.editReply({
                    content: `Image resolution is too high. I can't check this :/`
                });
            } else {
                this._interaction.editReply({
                    content: `Something happened and I can't analyse this.`
                });
            }
        }
    }

    private async DownloadAndSaveImage(imageUrl: string, imageName: string): Promise<string>{
        const imageNameWithDir = `${this._imageDirectory}${imageName}`;
        const image = await jimp.read(imageUrl);

        const savedFileName = `${imageNameWithDir}.jpg`
        await image.writeAsync(savedFileName);

        return savedFileName;
    }

    private async ClassifyImageAndCheckPredictions(imageFilename: string): Promise<boolean> {
        const tfImageResized = this.ImageFileToTensor(imageFilename);
        const predictions = await this._imageProcessor.Classify(tfImageResized);
        
        if (!isNull(predictions)){
            let found = false;
            predictions.forEach((prediction) => {
                this._predictionsToDetect.forEach((word) => {
                    if (prediction.className.includes(word)) {
                        if (!found){
                            found = true;
                        }
                    }
                });
            });

            return found;
        }

        return false;
    }

    private ImageFileToTensor(imageFilename: string): Tensor3D {
        const image = fs.readFileSync(imageFilename);
        return this._imageProcessor.ImageToTensor(image);
    }
}

