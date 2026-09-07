import { CURRENCIES } from '@/constants/CURRIENCIES';

export const formatAmount = (amount: number, currency: string): string => {
    const symbol = CURRENCIES.find((c) => c.code === currency)?.symbol;
    if (symbol && !isNaN(amount)) {
        return `${amount.toFixed(2)} ${symbol}`;
    }
    return '- - -';
};
