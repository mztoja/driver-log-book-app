export const formatQuantity = (quantity: number): string => {
    if (quantity === 0) {
        return '1';
    }
    if (Number.isInteger(quantity)) {
        return quantity.toString();
    }
    return quantity.toFixed(2);
};
