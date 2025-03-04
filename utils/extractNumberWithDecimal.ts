export const extractNumberWithDecimal = (string: string): string => {
    const match = string.replace(',', '.').match(/(\d*\.\d{0,2}|\d+)/);
    return match ? match[0] : '';
}