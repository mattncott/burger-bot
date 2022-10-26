import { EnvironmentMode } from ".";

export function LogInfo(message: any) {
    if (EnvironmentMode === 'production') return;
    
    console.log(message);
}

export function LogError(message: any) {
    console.error(message);
}