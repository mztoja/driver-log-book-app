export interface Entries {
    blockedDescription: string;
    dayStart: string;
    dayStop: string;
    dayExist: string;
    dayNotExist: string;
    addLog: string;
    addLogSuccess(x: string): string;
    crossBorder: string;
    crossBorderSwitchToAdd: string;
    crossBorderSwitchToChoose: string;
    border: string;
    crossBorderYouAre(x: string): string;
    dieselRefuel: string;
    adblueRefuel: string;
    expenceAdd: string;
    startedDayAction: string;
    startedDayActionCardInsert: string;
    finishedDayAction: string;
    finishedDayActionCardTakeOut: string;
}

export interface HomeInterface {
    en: Entries;
    pl: Entries;
}