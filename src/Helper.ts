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

export function IsUserOnCooldown(userCooldown: Date): boolean {

    if (userCooldown != null) {
        const now = new Date();
        return userCooldown > now;
    }

    return false;
}

export function TimeDifferenceInMinutes(dt2: Date) 
{
    const dt1 = new Date();
    let diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}

export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}