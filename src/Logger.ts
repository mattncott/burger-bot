import { EnvironmentMode } from "./Environment";

export function LogInfo(message: any) {
    if (EnvironmentMode === 'production') return;
    
    console.log(message);
}

export function StartUpLog(message: string)
{
    console.log(message);
}

export function LogError(message: any) {
    console.error(message);
}