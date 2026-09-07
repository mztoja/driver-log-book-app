interface Entries {
    // lista
    listTitle: string;
    apiError: string;
    empty: string;
    filterType: string;
    filterCountry: string;
    search: string;
    thType: string;
    thCountry: string;
    thCity: string;
    thNameStreet: string;
    // szczegóły / akcje
    gps: string;
    description: string;
    directions: string;
    openInMaps: string;
    openGps: string;
    markAsDestination: string;
    markedSuccess: string;
    markedError: string;
    edit: string;
    showActivities: string;
    // formularz dodawania / edycji
    addPlace: string;
    editPlace: string;
    submitAdd: string;
    submitEdit: string;
    type: string;
    name: string;
    street: string;
    code: string;
    city: string;
    country: string;
    lat: string;
    lon: string;
    isFavorite: string;
    isDestination: string;
    addSuccess: string;
    editSuccess: string;
    nameRequired: string;
    cityRequired: string;
    countryRequired: string;
    // czynności miejsca
    placeLogsHeader: (x: string) => string;
    logsEmpty: string;
    logsApiError: string;
    logTour: string;
    logDate: string;
    logAction: string;
    logCountry: string;
    logPlace: string;
    logOdometer: string;
    logNotes: string;
    logEdit: string;
    logEditHeader: string;
    logEditSuccess: string;
}

export interface PlacesInterface {
    en: Entries;
    pl: Entries;
}
