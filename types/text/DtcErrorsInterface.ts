interface Entries {
    invalidLoginData: string;
    country: string;
    noActiveRoute: string;
    activeRoute: string;
    registerResInvEmail: string;
    registerResEmailExist: string;
    actionNoExist: string;
    registerResInvPassword: string;
    registerCompanyNameNotExist: string;
    registerCompanyCityNotExist: string;
    trailerExist: string;
    noTrailer: string;
    countryConflict: string;
    dayExist: string;
    dayExistRegardRoute: string;
    noVehicle: string;
    truckNoExist: string;
    noWeight: string;
    noDescription: string;
    typeFuelBurned: string;
    dayNotExist: string;
    noLoadChosen: string;
    chosenLoadIsUnloaded: string;
    noLoadReceiver: string;
    noExpenseDescription: string;
    addVehicleRegEmpty: string;
    addVehicleWeightEmpty: string;
    vehicleRegExist: string;
    chooseServicedVehicle: string;
    noServiceEntry: string;
    youHaveToChooseRoutes: string;
    monthIncorrectFormat: string;
    cannotEditSettledTourData: string;
    apiUnauthorized: string;
    apiUnknownError: string;
    apiConnectionError: string;
}

export interface DtcErrorsInterface {
    en: Entries;
    pl: Entries;
}