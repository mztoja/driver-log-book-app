interface Entries {
    title: string;
    noActiveTour: string;
    routeNo: string;
    distance: string;
    lasts: string;
    and: string;
    day: string;
    days: string;
    in: string;
    youStartedDayAt: string;
    traveledToday: string;
    workingTimeUntil: string;
    dayTitle: string;
    tourSetTitle: string;
    truck: string;
    trailer: string;
    fuel: string;
    actualMass: string;
    noDataInfo: string;
    empty: string;
    destination: string;
    delete: string;
    deleteSuccess: string;
    noActiveDay: string;
    breakLasts: string;
    break9HourEnd: string;
    break11HourEnd: string;
    breakOver: string;
    breakIn: string;
    carriedLoads: string;
    // etykiety szczegółów pojazdu
    model: string;
    isLoadable: string;
    tankCapacity: string;
    yearOfProduction: string;
    weightDisp: string;
    techRev: string;
    insurance: string;
    tacho: string;
    nextService: string;
    notes: string;
    yes: string;
    no: string;
    expired: string;
}

export interface InfoInterface {
    en: Entries;
    pl: Entries;
}
