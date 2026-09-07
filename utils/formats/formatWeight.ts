export const formatWeight = (weight: number): string => {
    return weight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' kg';
};
