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

    if (userCooldown !== null && userCooldown !== undefined) {
        const now = new Date();
        return userCooldown > now;
    }

    return false;
}

export function TimeDifferenceInMinutes(dt2: Date) 
{
    const dt1 = new Date();
    var diff =(dt2.getTime() - dt1.getTime()) / 1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
}