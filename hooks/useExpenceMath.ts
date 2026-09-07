import React, { useEffect } from 'react';
import { FinanceEditData, GeneralFormData } from '@/types';

export type ExpanseChangeType = 'amount' | 'switch' | 'foreignAmount' | 'quantity' | 'unitPrice';

interface Markers {
    quantity: boolean;
    unitPrice: boolean;
    amount: boolean;
    foreignAmount: boolean;
    switch: 'false' | 'true',
}

interface ExpenseAddMathParams {
    foreignAmountSwitch: boolean;
    formData: GeneralFormData;
    updateFormData: (key: keyof GeneralFormData, value: string) => void;
    change: ExpanseChangeType;
}


const expenseAddMath = ({ foreignAmountSwitch, formData, updateFormData, change }: ExpenseAddMathParams): void => {
    const safeUpdate = (key: keyof GeneralFormData, newValue: string) => {
        if (String(formData[key]) !== String(newValue)) {
            updateFormData(key, newValue);
        }
    };

    switch (change) {
        case 'unitPrice': {
            if (Number(formData.expenseUnitPrice) > 0) {
                const amount = (Number(formData.expenseUnitPrice) * Number(formData.expenseQuantity)).toFixed(2);
                safeUpdate(foreignAmountSwitch ? 'expenseForeignAmount' : 'expenseAmount', amount);
            }
            break;
        }

        case 'quantity':
        case foreignAmountSwitch ? 'foreignAmount' : 'amount': {
            if (Number(formData.expenseQuantity) > 0) {
                const unitPrice = (Number(foreignAmountSwitch ? formData.expenseForeignAmount : formData.expenseAmount) / Number(formData.expenseQuantity)).toFixed(2);
                safeUpdate('expenseUnitPrice', unitPrice);
            }
            break;
        }

        case 'switch': {
            if (foreignAmountSwitch) {
                const amount = formData.expenseAmount;
                updateFormData('expenseForeignAmount', amount);
                updateFormData('expenseAmount', '');
            } else {
                const foreignAmount = formData.expenseForeignAmount;
                updateFormData('expenseForeignAmount', '');
                updateFormData('expenseAmount', foreignAmount);
            }
            break;
        }
    }
};

export const useAddExpenseMath = (
    formData: GeneralFormData,
    updateFormData: (key: keyof GeneralFormData, value: string) => void,
    markers: Markers,
) => {

    useEffect(() => {
        expenseAddMath({
            foreignAmountSwitch: markers.switch === 'true',
            formData,
            updateFormData,
            change: 'amount',
        });
    }, [markers.amount]);

    useEffect(() => {
        expenseAddMath({
            foreignAmountSwitch: markers.switch === 'true',
            formData,
            updateFormData,
            change: 'foreignAmount',
        });
    }, [markers.foreignAmount]);

    useEffect(() => {
        expenseAddMath({
            foreignAmountSwitch: markers.switch === 'true',
            formData,
            updateFormData,
            change: 'quantity',
        });
    }, [markers.quantity]);

    useEffect(() => {
        expenseAddMath({
            foreignAmountSwitch: markers.switch === 'true',
            formData,
            updateFormData,
            change: 'unitPrice',
        });
    }, [markers.unitPrice]);

    useEffect(() => {
        expenseAddMath({
            foreignAmountSwitch: markers.switch === 'true',
            formData,
            updateFormData,
            change: 'switch',
        });
    }, [markers.switch]);

}

// ---- wariant dla edycji wydatku (FinanceEditData) ----

interface EditExpenseMathParams {
    foreignAmountSwitch: boolean;
    formData: FinanceEditData;
    updateFormData: (key: keyof FinanceEditData, value: string) => void;
    change: ExpanseChangeType;
}

const editExpenseMath = ({ foreignAmountSwitch, formData, updateFormData, change }: EditExpenseMathParams): void => {
    const safeUpdate = (key: keyof FinanceEditData, newValue: string) => {
        if (String(formData[key]) !== String(newValue)) {
            updateFormData(key, newValue);
        }
    };
    const activeAmountKey: keyof FinanceEditData = foreignAmountSwitch ? 'foreignAmount' : 'amount';

    switch (change) {
        case 'unitPrice': {
            if (Number(formData.unitPrice) > 0) {
                safeUpdate(activeAmountKey, (Number(formData.unitPrice) * Number(formData.quantity)).toFixed(2));
            }
            break;
        }
        case 'quantity':
        case 'amount':
        case 'foreignAmount': {
            if (Number(formData.quantity) > 0) {
                safeUpdate('unitPrice', (Number(formData[activeAmountKey]) / Number(formData.quantity)).toFixed(2));
            }
            break;
        }
        case 'switch': {
            if (foreignAmountSwitch) {
                updateFormData('foreignAmount', formData.amount);
                updateFormData('amount', '');
            } else {
                updateFormData('amount', formData.foreignAmount);
                updateFormData('foreignAmount', '');
            }
            break;
        }
    }
};

export const useEditExpenseMath = (
    formData: FinanceEditData,
    updateFormData: (key: keyof FinanceEditData, value: string) => void,
    markers: Markers,
) => {
    const foreignAmountSwitch = markers.switch === 'true';

    useEffect(() => {
        editExpenseMath({ foreignAmountSwitch, formData, updateFormData, change: 'amount' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.amount]);

    useEffect(() => {
        editExpenseMath({ foreignAmountSwitch, formData, updateFormData, change: 'foreignAmount' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.foreignAmount]);

    useEffect(() => {
        editExpenseMath({ foreignAmountSwitch, formData, updateFormData, change: 'quantity' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.quantity]);

    useEffect(() => {
        editExpenseMath({ foreignAmountSwitch, formData, updateFormData, change: 'unitPrice' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.unitPrice]);

    useEffect(() => {
        editExpenseMath({ foreignAmountSwitch, formData, updateFormData, change: 'switch' });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers.switch]);
};