import * as logger from "winston";
import { IsDevelopmentEnv } from "../BurgerBotStart";

function SetupLog(){
    logger.remove(logger.transports.Console);
    logger.add(new logger.transports.Console);
}

export function LogInfo(message: any) {
    if (IsDevelopmentEnv){
        SetupLog()
        logger.info(message);
    }
}

export function LogError(message: any) {
    SetupLog()
    logger.error(message);
}