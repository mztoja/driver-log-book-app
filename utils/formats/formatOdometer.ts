export const formatOdometer = (odometer: number, returnNA?: boolean): string => {
    if (odometer > 0) {
        return odometer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + ' km';
    }
    if (returnNA) {
        return '- - -';
    }
    return '0 km';
}