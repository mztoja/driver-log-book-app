import { SnackbarType } from "@/context/SnackbarContext";
import { Lang, getText } from "./getText";
import { UserInterface } from "@/types";

interface HandleDtcErrors {
    message: string;
    type: SnackbarType;
}

interface GlobalData {
    user: UserInterface | null;
    offlineLang: Lang;
}

export const handleDtcErrors = (dtc: string, globalData: GlobalData): HandleDtcErrors => {

    switch (dtc) {
        case 'invalidLoginData':
            return {
                message: getText('dtcErrors', 'invalidLoginData', globalData),
                type: 'warning',
            }
        case 'country':
            return {
                message: getText('dtcErrors', 'country', globalData),
                type: 'warning',
            }
        case 'startData.country':
            return {
                message: getText('dtcErrors', 'country', globalData),
                type: 'warning',
            }
        case 'stopData.country':
            return {
                message: getText('dtcErrors', 'country', globalData),
                type: 'warning',
            }
        case 'logData.country':
            return {
                message: getText('dtcErrors', 'country', globalData),
                type: 'warning',
            }
        case 'unloadingLogData.country':
            return {
                message: getText('dtcErrors', 'country', globalData),
                type: 'warning',
            }
        case 'loadingLogData.country':
            return {
                message: getText('dtcErrors', 'country', globalData),
                type: 'warning',
            }
        case 'noActiveRoute':
            return {
                message: getText('dtcErrors', 'noActiveRoute', globalData),
                type: 'info',
            }
        case 'activeRoute':
            return {
                message: getText('dtcErrors', 'activeRoute', globalData),
                type: 'info',
            }
        case 'email':
            return {
                message: getText('dtcErrors', 'registerResInvEmail', globalData),
                type: 'warning',
            }
        case 'email exist':
            return {
                message: getText('dtcErrors', 'registerResEmailExist', globalData),
                type: 'warning',
            }
        case 'action':
            return {
                message: getText('dtcErrors', 'actionNoExist', globalData),
                type: 'info',
            }
        case 'startData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', globalData),
                type: 'info',
            }
        case 'unloadingLogData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', globalData),
                type: 'info',
            }
        case 'loadingLogData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', globalData),
                type: 'info',
            }
        case 'stopData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', globalData),
                type: 'info',
            }
        case 'logData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', globalData),
                type: 'info',
            }
        case 'password':
            return {
                message: getText('dtcErrors', 'registerResInvPassword', globalData),
                type: 'warning',
            }
        case 'companyName':
            return {
                message: getText('dtcErrors', 'registerCompanyNameNotExist', globalData),
                type: 'warning',
            }
        case 'companyCity':
            return {
                message: getText('dtcErrors', 'registerCompanyCityNotExist', globalData),
                type: 'warning',
            }
        case 'trailerExist':
            return {
                message: getText('dtcErrors', 'trailerExist', globalData),
                type: 'info',
            }
        case 'noTrailer':
            return {
                message: getText('dtcErrors', 'noTrailer', globalData),
                type: 'info',
            }
        case 'countryConflict':
            return {
                message: getText('dtcErrors', 'countryConflict', globalData),
                type: 'warning',
            }
        case 'activeDay':
            return {
                message: getText('dtcErrors', 'dayExist', globalData),
                type: 'info',
            }
        case 'dayExistRegardRoute':
            return {
                message: getText('dtcErrors', 'dayExistRegardRoute', globalData),
                type: 'info',
            }
        case 'vehicle':
            return {
                message: getText('dtcErrors', 'noVehicle', globalData),
                type: 'warning',
            }
        case 'truck':
            return {
                message: getText('dtcErrors', 'truckNoExist', globalData),
                type: 'warning',
            }
        case 'weight':
            return {
                message: getText('dtcErrors', 'noWeight', globalData),
                type: 'warning',
            }
        case 'description':
            return {
                message: getText('dtcErrors', 'noDescription', globalData),
                type: 'warning',
            }
        case 'name':
            return {
                message: getText('dtcErrors', 'registerCompanyNameNotExist', globalData),
                type: 'warning',
            }
        case 'city':
            return {
                message: getText('dtcErrors', 'registerCompanyCityNotExist', globalData),
                type: 'warning',
            }
        case 'fuelCombustion':
            return {
                message: getText('dtcErrors', 'typeFuelBurned', globalData),
                type: 'warning',
            }
        case 'dayNotExist':
            return {
                message: getText('dtcErrors', 'dayNotExist', globalData),
                type: 'info',
            }
        case 'loadId':
            return {
                message: getText('dtcErrors', 'noLoadChosen', globalData),
                type: 'warning',
            }
        case 'noChosenLoad':
            return {
                message: getText('dtcErrors', 'noLoadChosen', globalData),
                type: 'warning',
            }
        case 'chosenLoadIsUnloaded':
            return {
                message: getText('dtcErrors', 'chosenLoadIsUnloaded', globalData),
                type: 'warning',
            }
        case 'noLoadReceiver':
            return {
                message: getText('dtcErrors', 'noLoadReceiver', globalData),
                type: 'warning',
            }
        case 'expenseDescriptionEmpty':
            return {
                message: getText('dtcErrors', 'noExpenseDescription', globalData),
                type: 'warning',
            }
        case 'addVehicleRegEmpty':
            return {
                message: getText('dtcErrors', 'addVehicleRegEmpty', globalData),
                type: 'error',
            }
        case 'addVehicleWeightEmpty':
            return {
                message: getText('dtcErrors', 'addVehicleWeightEmpty', globalData),
                type: 'error',
            }
        case 'vehicleRegExist':
            return {
                message: getText('dtcErrors', 'vehicleRegExist', globalData),
                type: 'error',
            }
        case 'chooseServicedVehicle':
            return {
                message: getText('dtcErrors', 'chooseServicedVehicle', globalData),
                type: 'error',
            }
        case 'noServiceEntry':
            return {
                message: getText('dtcErrors', 'noServiceEntry', globalData),
                type: 'error',
            }
        case 'youHaveToChooseRoutes':
            return {
                message: getText('dtcErrors', 'youHaveToChooseRoutes', globalData),
                type: 'warning',
            }
        case 'monthIncorrectFormat':
            return {
                message: getText('dtcErrors', 'monthIncorrectFormat', globalData),
                type: 'warning',
            }
        case 'cannotEditSettledTourData':
            return {
                message: getText('dtcErrors', 'cannotEditSettledTourData', globalData),
                type: 'warning',
            }
        case 'Unauthorized':
            return {
                message: getText('dtcErrors', 'apiUnauthorized', globalData),
                type: 'error',
            }
        default:
            return {
                message: getText('dtcErrors', 'apiUnknownError', globalData),
                type: 'error',
            }
    }
}