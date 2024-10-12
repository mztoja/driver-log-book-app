import { SnackbarType } from "@/context/SnackbarContext";
import { LangInterface } from "@/types";
import { getText } from "./getText";

interface HandleDtcErrors {
    message: string;
    type: SnackbarType;
}

export const handleDtcErrors = (dtc: string, lang: LangInterface): HandleDtcErrors => {

    switch (dtc) {
        case 'invalidLoginData':
            return {
                message: getText('dtcErrors', 'invalidLoginData', lang),
                type: 'warning',
            }
        case 'country':
            return {
                message: getText('dtcErrors', 'country', lang),
                type: 'warning',
            }
        case 'startData.country':
            return {
                message: getText('dtcErrors', 'country', lang),
                type: 'warning',
            }
        case 'stopData.country':
            return {
                message: getText('dtcErrors', 'country', lang),
                type: 'warning',
            }
        case 'logData.country':
            return {
                message: getText('dtcErrors', 'country', lang),
                type: 'warning',
            }
        case 'unloadingLogData.country':
            return {
                message: getText('dtcErrors', 'country', lang),
                type: 'warning',
            }
        case 'loadingLogData.country':
            return {
                message: getText('dtcErrors', 'country', lang),
                type: 'warning',
            }
        case 'noActiveRoute':
            return {
                message: getText('dtcErrors', 'noActiveRoute', lang),
                type: 'info',
            }
        case 'activeRoute':
            return {
                message: getText('dtcErrors', 'activeRoute', lang),
                type: 'info',
            }
        case 'email':
            return {
                message: getText('dtcErrors', 'registerResInvEmail', lang),
                type: 'warning',
            }
        case 'email exist':
            return {
                message: getText('dtcErrors', 'registerResEmailExist', lang),
                type: 'warning',
            }
        case 'action':
            return {
                message: getText('dtcErrors', 'actionNoExist', lang),
                type: 'info',
            }
        case 'startData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', lang),
                type: 'info',
            }
        case 'unloadingLogData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', lang),
                type: 'info',
            }
        case 'loadingLogData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', lang),
                type: 'info',
            }
        case 'stopData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', lang),
                type: 'info',
            }
        case 'logData.action':
            return {
                message: getText('dtcErrors', 'actionNoExist', lang),
                type: 'info',
            }
        case 'password':
            return {
                message: getText('dtcErrors', 'registerResInvPassword', lang),
                type: 'warning',
            }
        case 'companyName':
            return {
                message: getText('dtcErrors', 'registerCompanyNameNotExist', lang),
                type: 'warning',
            }
        case 'companyCity':
            return {
                message: getText('dtcErrors', 'registerCompanyCityNotExist', lang),
                type: 'warning',
            }
        case 'trailerExist':
            return {
                message: getText('dtcErrors', 'trailerExist', lang),
                type: 'info',
            }
        case 'noTrailer':
            return {
                message: getText('dtcErrors', 'noTrailer', lang),
                type: 'info',
            }
        case 'countryConflict':
            return {
                message: getText('dtcErrors', 'countryConflict', lang),
                type: 'warning',
            }
        case 'activeDay':
            return {
                message: getText('dtcErrors', 'dayExist', lang),
                type: 'info',
            }
        case 'dayExistRegardRoute':
            return {
                message: getText('dtcErrors', 'dayExistRegardRoute', lang),
                type: 'info',
            }
        case 'vehicle':
            return {
                message: getText('dtcErrors', 'noVehicle', lang),
                type: 'warning',
            }
        case 'truck':
            return {
                message: getText('dtcErrors', 'truckNoExist', lang),
                type: 'warning',
            }
        case 'weight':
            return {
                message: getText('dtcErrors', 'noWeight', lang),
                type: 'warning',
            }
        case 'description':
            return {
                message: getText('dtcErrors', 'noDescription', lang),
                type: 'warning',
            }
        case 'name':
            return {
                message: getText('dtcErrors', 'registerCompanyNameNotExist', lang),
                type: 'warning',
            }
        case 'city':
            return {
                message: getText('dtcErrors', 'registerCompanyCityNotExist', lang),
                type: 'warning',
            }
        case 'fuelCombustion':
            return {
                message: getText('dtcErrors', 'typeFuelBurned', lang),
                type: 'warning',
            }
        case 'dayNotExist':
            return {
                message: getText('dtcErrors', 'dayNotExist', lang),
                type: 'info',
            }
        case 'loadId':
            return {
                message: getText('dtcErrors', 'noLoadChosen', lang),
                type: 'warning',
            }
        case 'noChosenLoad':
            return {
                message: getText('dtcErrors', 'noLoadChosen', lang),
                type: 'warning',
            }
        case 'chosenLoadIsUnloaded':
            return {
                message: getText('dtcErrors', 'chosenLoadIsUnloaded', lang),
                type: 'warning',
            }
        case 'noLoadReceiver':
            return {
                message: getText('dtcErrors', 'noLoadReceiver', lang),
                type: 'warning',
            }
        case 'expenseDescriptionEmpty':
            return {
                message: getText('dtcErrors', 'noExpenseDescription', lang),
                type: 'warning',
            }
        case 'addVehicleRegEmpty':
            return {
                message: getText('dtcErrors', 'addVehicleRegEmpty', lang),
                type: 'error',
            }
        case 'addVehicleWeightEmpty':
            return {
                message: getText('dtcErrors', 'addVehicleWeightEmpty', lang),
                type: 'error',
            }
        case 'vehicleRegExist':
            return {
                message: getText('dtcErrors', 'vehicleRegExist', lang),
                type: 'error',
            }
        case 'chooseServicedVehicle':
            return {
                message: getText('dtcErrors', 'chooseServicedVehicle', lang),
                type: 'error',
            }
        case 'noServiceEntry':
            return {
                message: getText('dtcErrors', 'noServiceEntry', lang),
                type: 'error',
            }
        case 'youHaveToChooseRoutes':
            return {
                message: getText('dtcErrors', 'youHaveToChooseRoutes', lang),
                type: 'warning',
            }
        case 'monthIncorrectFormat':
            return {
                message: getText('dtcErrors', 'monthIncorrectFormat', lang),
                type: 'warning',
            }
        case 'cannotEditSettledTourData':
            return {
                message: getText('dtcErrors', 'cannotEditSettledTourData', lang),
                type: 'warning',
            }
        case 'Unauthorized':
            return {
                message: getText('dtcErrors', 'apiUnauthorized', lang),
                type: 'error',
            }
        default:
            return {
                message: getText('dtcErrors', 'apiUnknownError', lang),
                type: 'error',
            }
    }
}