import { warn, error } from "firebase-functions/lib/logger";

export function LogInfo(message: any) {
    warn(message, {structuredData: true});
}

export function LogError(message: any) {
    error(message, {structuredData: true});
}