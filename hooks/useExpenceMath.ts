import { useEffect, useRef } from 'react';
import { FinanceEditData, GeneralFormData } from '@/types';

export type ExpanseChangeType = 'amount' | 'switch' | 'foreignAmount' | 'quantity' | 'unitPrice';

/**
 * Markery przełączane w onChange pól (tylko zmiany wpisane przez użytkownika – wartości ustawione
 * programowo nie przełączają markerów, więc nie wywołują przeliczenia zwrotnego).
 */
interface Markers {
    quantity: boolean;
    unitPrice: boolean;
    amount: boolean;
    foreignAmount: boolean;
    switch: 'false' | 'true',
}

/*
 * Algorytm (ten sam co na froncie, hooks/useExpenseMath.ts):
 * - wpisana cena jednostkowa -> kwota = cena × ilość
 * - wpisana kwota (aktywna: obca przy płatności w obcej walucie) -> cena = kwota / ilość
 * - zmiana ilości -> przeliczamy to, czego użytkownik NIE wpisał ostatnio:
 *   ostatnio cena -> kwota; ostatnio kwota -> cena. Wcześniej ilość zawsze przeliczała cenę z kwoty,
 *   więc „cena 6,50 → ilość 50" obniżało cenę zamiast policzyć kwotę.
 */
type Source = 'unitPrice' | 'amount' | null;

const round2 = (n: number): string => (Math.round((n + Number.EPSILON) * 100) / 100).toString();

interface Fields {
    quantity: string;
    unitPrice: string;
    amount: string; // aktywna kwota (obca albo krajowa – zależnie od przełącznika)
}

/** Co przeliczyć po zmianie `change`; null – nic. Aktualizuje `source`. */
const compute = (
    change: 'unitPrice' | 'amount' | 'quantity',
    f: Fields,
    source: { current: Source },
): { key: 'amount' | 'unitPrice'; value: string } | null => {
    const qty = Number(f.quantity);
    const price = Number(f.unitPrice);
    const amount = Number(f.amount);

    if (change === 'unitPrice') {
        source.current = 'unitPrice';
        return price > 0 ? { key: 'amount', value: round2(price * qty) } : null;
    }
    if (change === 'amount') {
        source.current = 'amount';
        return qty > 0 ? { key: 'unitPrice', value: round2(amount / qty) } : null;
    }
    // quantity
    if (qty <= 0) return null;
    if (source.current === 'amount' && amount > 0) return { key: 'unitPrice', value: round2(amount / qty) };
    if (price > 0) return { key: 'amount', value: round2(price * qty) };
    if (amount > 0) return { key: 'unitPrice', value: round2(amount / qty) };
    return null;
};

export const useAddExpenseMath = (
    formData: GeneralFormData,
    updateFormData: (key: keyof GeneralFormData, value: string) => void,
    markers: Markers,
) => {
    const source = useRef<Source>(null);
    // efekty odpalają się też przy montowaniu – przeliczamy tylko zmiany wpisane przez użytkownika
    // (inaczej otwarcie edycji mogłoby np. zaokrąglić cenę i nadpisać zapisaną kwotę)
    const ready = useRef<boolean>(false);
    const foreign = markers.switch === 'true';
    const amountKey: keyof GeneralFormData = foreign ? 'expenseForeignAmount' : 'expenseAmount';

    const run = (change: 'unitPrice' | 'amount' | 'quantity'): void => {
        if (!ready.current) return;
        const result = compute(change, {
            quantity: formData.expenseQuantity,
            unitPrice: formData.expenseUnitPrice,
            amount: formData[amountKey],
        }, source);
        if (!result) return;
        const key: keyof GeneralFormData = result.key === 'amount' ? amountKey : 'expenseUnitPrice';
        if (String(formData[key]) !== result.value) updateFormData(key, result.value);
    };

    useEffect(() => {
        if (!foreign) run('amount'); // krajowa kwota liczy się do ceny tylko bez waluty obcej
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.amount]);

    useEffect(() => {
        if (foreign) run('amount');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.foreignAmount]);

    useEffect(() => {
        run('quantity');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.quantity]);

    useEffect(() => {
        run('unitPrice');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.unitPrice]);

    // przełącznik waluty obcej – przenosimy kwotę między polami (jak front)
    useEffect(() => {
        if (!ready.current) return;
        if (foreign) {
            updateFormData('expenseForeignAmount', formData.expenseAmount);
            updateFormData('expenseAmount', '');
        } else {
            updateFormData('expenseAmount', formData.expenseForeignAmount);
            updateFormData('expenseForeignAmount', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.switch]);

    // ostatni efekt – po nim kolejne przełączenia markerów to już zmiany użytkownika
    useEffect(() => {
        ready.current = true;
    }, []);
};

// ---- wariant dla edycji wydatku (FinanceEditData) ----

export const useEditExpenseMath = (
    formData: FinanceEditData,
    updateFormData: (key: keyof FinanceEditData, value: string) => void,
    markers: Markers,
) => {
    const source = useRef<Source>(null);
    // efekty odpalają się też przy montowaniu – przeliczamy tylko zmiany wpisane przez użytkownika
    // (inaczej otwarcie edycji mogłoby np. zaokrąglić cenę i nadpisać zapisaną kwotę)
    const ready = useRef<boolean>(false);
    const foreign = markers.switch === 'true';
    const amountKey: keyof FinanceEditData = foreign ? 'foreignAmount' : 'amount';

    const run = (change: 'unitPrice' | 'amount' | 'quantity'): void => {
        if (!ready.current) return;
        const result = compute(change, {
            quantity: formData.quantity,
            unitPrice: formData.unitPrice,
            amount: String(formData[amountKey] ?? ''),
        }, source);
        if (!result) return;
        const key: keyof FinanceEditData = result.key === 'amount' ? amountKey : 'unitPrice';
        if (String(formData[key]) !== result.value) updateFormData(key, result.value);
    };

    useEffect(() => {
        if (!foreign) run('amount');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.amount]);

    useEffect(() => {
        if (foreign) run('amount');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.foreignAmount]);

    useEffect(() => {
        run('quantity');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.quantity]);

    useEffect(() => {
        run('unitPrice');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.unitPrice]);

    useEffect(() => {
        if (!ready.current) return;
        if (foreign) {
            updateFormData('foreignAmount', formData.amount);
            updateFormData('amount', '');
        } else {
            updateFormData('amount', formData.foreignAmount);
            updateFormData('foreignAmount', '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.switch]);

    // ostatni efekt – po nim kolejne przełączenia markerów to już zmiany użytkownika
    useEffect(() => {
        ready.current = true;
    }, []);
};
