export const formatFuelQuantity = (
    fuel: number | string | null,
    option: 'integer' | 'oneDecimal' | 'twoDecimals' = 'integer',
): string => {
    const quantity = parseFloat(fuel as string);
    if (isNaN(quantity)) {
        return '--- L';
    }
    switch (option) {
        case 'oneDecimal':
            return quantity.toFixed(1) + ' L';
        case 'twoDecimals':
            return quantity.toFixed(2) + ' L';
        case 'integer':
        default:
            return quantity.toFixed(0) + ' L';
    }
};
