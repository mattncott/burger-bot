import { Attachment } from "discord.js";

export function getFileExtension(url: string){
    return url.split('.').pop();
}

export function isNull(attachment: any){
    return attachment === undefined || attachment === null;
}

export function hasSpoilerImage(fileName: any){
    return fileName.includes("SPOILER");
}

export function getAttachment(attachments: any): Attachment {
    return attachments.attachments[0];
}

export function hasTaggedUser(message: string){
    return message.includes("<@")
}

export function getTaggedUser(message: string){
    return message.substring(message.indexOf("<@"));
}