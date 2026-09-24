interface Entries {
    // lista
    listTitle: string;
    trucksTab: string;
    trailersTab: string;
    company: string;
    apiTrucksError: string;
    apiTrailersError: string;
    empty: string;
    currentVehicle: string;
    // pola pojazdu
    truck: string;
    trailer: string;
    registrationPlate: string;
    model: string;
    yearOfProduction: string;
    isLoadable: string;
    tankCapacity: string;
    weight: string;
    weightDisp: string;
    techRev: string;
    insurance: string;
    tacho: string;
    nextService: string;
    notes: string;
    yes: string;
    no: string;
    // formularze
    addVehicle: string;
    addSuccess: string;
    edit: string;
    editHeader(x: string): string;
    editSuccessInfo: string;
    noChanges: string;
    // serwisy
    showServices: string;
    serviceHeader(x: string): string;
    serviceType: string;
    serviceAll: string;
    serviceMaintenance: string;
    serviceService: string;
    serviceDate: string;
    servicePlace: string;
    serviceOdometer: string;
    serviceEmpty: string;
    search: string;
    editServiceHeader: string;
    editLogLegend: string;
    editServiceSuccess: string;
}

export interface VehiclesInterface {
    en: Entries;
    pl: Entries;
}
