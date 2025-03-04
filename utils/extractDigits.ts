export const extractDigits = (string: string): string => {
    return string.replace(/\D/g, '');
}