export const formatFuelCombustion = (fuel: number, distance: number): string => {
    const combustion = (fuel * 100) / distance;
    if (isNaN(combustion) || !isFinite(combustion)) {
        return '- - -';
    }
    return `∅ ${combustion.toFixed(1)}`;
};
