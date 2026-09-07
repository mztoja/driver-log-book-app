import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { FinanceEditData, FinanceInterface, LogEditData } from '@/types';
import { ItemDescriptionInput } from '@/components/inputs/finances/ItemDescriptionInput';
import { AmountInput } from '@/components/inputs/finances/AmountInput';
import { ExpenseQuantityInput } from '@/components/inputs/finances/ExpenseQuantityInput';
import { UnitPriceInput } from '@/components/inputs/finances/UnitPriceInput';
import { PaymentSelect } from '@/components/inputs/finances/PaymentSelect';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import { SendButton } from '@/components/buttons/SendButton';
import { useEditExpenseMath } from '@/hooks/useExpenceMath';
import { LogFieldset, MoreFieldsToggle } from './fields';

interface Props {
    finance: FinanceInterface | null;
    onClose: () => void;
    onSaved: () => void;
}

const logForm = (log: FinanceInterface['logData']): LogEditData => ({
    id: 0,
    date: log?.date ?? '',
    action: log?.action ?? '',
    country: log?.country ?? '',
    place: log?.place ?? '',
    placeId: log?.placeId ? log.placeId.toString() : '0',
    odometer: log?.odometer ? log.odometer.toString() : '0',
    notes: log?.notes ?? '',
});

const formFromFinance = (fin: FinanceInterface): FinanceEditData => ({
    id: fin.id,
    logData: { ...logForm(fin.logData), id: fin.logId },
    itemDescription: fin.itemDescription ?? '',
    quantity: fin.quantity ? fin.quantity.toString() : '1',
    amount: fin.amount ? fin.amount.toString() : '',
    currency: fin.currency ?? '',
    foreignAmount: fin.foreignAmount ? fin.foreignAmount.toString() : '',
    foreignCurrency: fin.foreignCurrency ?? '',
    payment: fin.payment ?? '',
    unitPrice:
        Number(fin.quantity) > 0 && Number(fin.amount) > 0
            ? (Number(fin.amount) / Number(fin.quantity)).toFixed(2)
            : '',
});

export const FinanceEditModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState<FinanceEditData>(
        props.finance ? formFromFinance(props.finance) : formFromFinance({ id: 0 } as FinanceInterface),
    );
    const [more, setMore] = useState<boolean>(false);
    const [switchValue, setSwitchValue] = useState<'true' | 'false'>(
        props.finance && props.finance.foreignCurrency !== '' ? 'true' : 'false',
    );
    const [quantityMarker, setQuantityMarker] = useState<boolean>(false);
    const [unitPriceMarker, setUnitPriceMarker] = useState<boolean>(false);
    const [amountMarker, setAmountMarker] = useState<boolean>(false);
    const [foreignAmountMarker, setForeignAmountMarker] = useState<boolean>(false);

    const update = (key: keyof FinanceEditData, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const updateLog = (key: keyof LogEditData, value: string): void => {
        setForm((prev) => ({ ...prev, logData: { ...prev.logData, [key]: value } }));
    };

    useEditExpenseMath(form, update, {
        quantity: quantityMarker,
        unitPrice: unitPriceMarker,
        amount: amountMarker,
        foreignAmount: foreignAmountMarker,
        switch: switchValue,
    });

    if (!props.finance) return null;

    const send = (): void => {
        const { unitPrice, ...rest } = form;
        void unitPrice;
        const sendData = {
            ...rest,
            id: props.finance!.id,
            logData: { ...form.logData, id: props.finance!.logId },
        };
        fetchData<FinanceInterface>(API_ENDPOINTS.editFinance, { method: 'PATCH', sendData }, { showSnackbar }).then((res) => {
            if (res.success) {
                showSnackbar(getText('tours', 'editSuccess', lang), 'success');
                props.onSaved();
            }
        });
    };

    return (
        <MainFormModal visible setVisible={() => props.onClose()} title={getText('tours', 'financeEditHeader', lang)}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                <LogFieldset value={form.logData} onChange={updateLog} showActivity />

                <ItemDescriptionInput value={form.itemDescription} onChange={(e) => update('itemDescription', e)} />
                <AmountInput
                    valueAmount={form.amount}
                    valueCurrency={form.currency}
                    onChangeAmount={(e) => update('amount', e)}
                    onChangeCurrency={(e) => update('currency', e)}
                    options={{ currencyDisable: true }}
                    marker={setAmountMarker}
                />
                <PaymentSelect value={form.payment} onChange={(e) => update('payment', e)} editMode />

                <MoreFieldsToggle expanded={more} onToggle={() => setMore((p) => !p)} />

                {more && (
                    <>
                        <View style={{ alignSelf: 'center' }}>
                            <ExpenseQuantityInput value={form.quantity} onChange={(e) => update('quantity', e)} marker={setQuantityMarker} />
                        </View>
                        <View style={{ alignSelf: 'center' }}>
                            <UnitPriceInput value={form.unitPrice} onChange={(e) => update('unitPrice', e)} marker={setUnitPriceMarker} />
                        </View>
                        <OnOffSwitch
                            label={getText('home', 'expenseForeignCurrency', lang)}
                            value={switchValue}
                            onChange={(e) => setSwitchValue(e)}
                        />
                        {switchValue === 'true' && (
                            <AmountInput
                                valueAmount={form.foreignAmount}
                                valueCurrency={form.foreignCurrency}
                                onChangeAmount={(e) => update('foreignAmount', e)}
                                onChangeCurrency={(e) => update('foreignCurrency', e)}
                                marker={setForeignAmountMarker}
                            />
                        )}
                    </>
                )}

                <SendButton onPress={send} text={getText('tours', 'editRecord', lang)} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
