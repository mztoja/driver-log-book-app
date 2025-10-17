import React from "react";
import { AddExpenseData, ExpenseEnum, GeneralFormData } from "@/types";
import { MainFormModal } from "../MainFormModal";
import { ScrollView, View } from "react-native";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { SendButton } from "@/components/buttons/SendButton";
import { useApi } from "@/hooks/useApi";
import { ItemDescriptionInput } from "@/components/inputs/finances/ItemDescriptionInput";
import { AmountInput } from "@/components/inputs/finances/AmountInput";
import { ExpenseQuantityInput } from "@/components/inputs/finances/ExpenseQuantityInput";
import { UnitPriceInput } from "@/components/inputs/finances/UnitPriceInput";
import { PaymentSelect } from "@/components/inputs/finances/PaymentSelect";
import { OnOffSwitch } from "@/components/inputs/commons/OnOffSwitch";
import { COUNTRIES } from "@/constants/COUNTRIES";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useAddExpenseMath } from "@/hooks/useExpenceMath";
import { useSnackbar } from "@/hooks/useSnackbar";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    expenseType: ExpenseEnum;
}

export const ExpenseAdd: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm, expenseType } = props;
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const { user } = useGlobalState();
    const [switchValue, setSwitchValue] = React.useState<'false' | 'true'>('false');
    const [foreignCurrency, setForeignCurrency] = React.useState<string>('');
    const [amountMarker, setAmountMarker] = React.useState<boolean>(false);
    const [foreignAmountMarker, setForeignAmountMarker] = React.useState<boolean>(false);
    const [unitPriceMarker, setUnitPriceMarker] = React.useState<boolean>(false);
    const [quantityMarker, setQuantityMarker] = React.useState<boolean>(false);

    const txt = {
        title: {
            [ExpenseEnum.standard]: getText('home', 'addExpense'),
            [ExpenseEnum.fuel]: getText('home', 'dieselRefuel'),
            [ExpenseEnum.def]: getText('home', 'adblueRefuel'),
        }[expenseType] || getText('home', 'addExpense'),
        paymentForeignCurrency: getText('home', 'paymentForeignCurrency'),
        diesel: getText('home', 'dieselRefuel'),
        def: getText('home', 'adblueRefuel'),
        actionAdd: getText('home', 'expenseAddAction'),
        success: getText('home', 'addedExpenseActionSuccess'),
    };

    React.useEffect(() => {
        if (user && props.visible) {
            const find = COUNTRIES.find((country) => country.code === user.country);
            if (find) {
                setForeignCurrency(find.currency);
                if (find.currency !== user.currency) setSwitchValue('true');
            }
        }
        // eslint-disable-next-line
    }, [props.visible]);

    useAddExpenseMath(form, setForm, {
        quantity: quantityMarker,
        unitPrice: unitPriceMarker,
        amount: amountMarker,
        foreignAmount: foreignAmountMarker,
        switch: switchValue,
    });

    const send = (): void => {
        const itemDescription =
            props.expenseType === ExpenseEnum.fuel
                ? txt.diesel
                : props.expenseType === ExpenseEnum.def
                    ? txt.def
                    : form.expenseItemDescription;

        const sendData: AddExpenseData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            action: txt.actionAdd + ': ' + itemDescription,
            payment: form.payment,
            expenseItemDescription: itemDescription,
            expenseQuantity: form.expenseQuantity !== ''
                ? form.expenseQuantity
                : '0',
            expenseUnitPrice: form.expenseUnitPrice !== ''
                ? form.expenseUnitPrice
                : '0',
            expenseCurrency: form.expenseCurrency,
            expenseAmount: form.expenseAmount !== ''
                ? form.expenseAmount
                : '0',
            expenseForeignCurrency: form.expenseForeignCurrency,
            expenseForeignAmount: form.expenseForeignAmount !== ''
                ? form.expenseForeignAmount
                : '0',
            expenseType: props.expenseType,
        }

        fetchData(API_ENDPOINTS.CREATE_EXPENSE, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.success, 'success');
                    props.setForm('expenseItemDescription', '');
                    props.setForm('expenseQuantity', '1');
                    props.setForm('expenseAmount', '');
                    props.setForm('expenseUnitPrice', '');
                    props.setForm('expenseForeignAmount', '');
                    props.setlastLogRefresh((prev => !prev));
                    props.setVisible(false);
                }
            });
    }

    return (
        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
            title={txt.title}
        >
            <ScrollView style={STYLES.scrollView}>
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <ItemDescriptionInput
                    value={
                        expenseType === ExpenseEnum.fuel
                            ? txt.diesel
                            : expenseType === ExpenseEnum.def
                                ? txt.def
                                : form.expenseItemDescription
                    }
                    onChange={(e) => setForm('expenseItemDescription', e)}
                    disabled={expenseType !== ExpenseEnum.standard}
                />
                <View style={{ alignSelf: 'center' }}>
                    <ExpenseQuantityInput
                        value={form.expenseQuantity}
                        onChange={(e) => setForm('expenseQuantity', e)}
                        marker={setQuantityMarker}
                    />
                </View>
                <View style={{ alignSelf: 'center' }}>
                    <UnitPriceInput
                        value={form.expenseUnitPrice}
                        onChange={(e) => setForm('expenseUnitPrice', e)}
                        marker={setUnitPriceMarker}
                    />
                </View>
                <PaymentSelect
                    value={form.payment}
                    onChange={(e) => setForm('payment', e)}
                />
                <OnOffSwitch
                    value={switchValue}
                    onChange={(e) => setSwitchValue(e)}
                    label={txt.paymentForeignCurrency}
                />
                {switchValue === 'true' &&
                    <AmountInput
                        valueAmount={form.expenseForeignAmount}
                        valueCurrency={
                            form.expenseForeignCurrency !== ''
                                ? form.expenseForeignCurrency
                                : foreignCurrency
                        }
                        onChangeAmount={(e) => setForm('expenseForeignAmount', e)}
                        onChangeCurrency={(e) => setForm('expenseForeignCurrency', e)}
                        marker={setForeignAmountMarker}
                    />
                }
                <AmountInput
                    valueAmount={form.expenseAmount}
                    valueCurrency={form.expenseCurrency}
                    onChangeAmount={(e) => setForm('expenseAmount', e)}
                    onChangeCurrency={(e) => setForm('expenseCurrency', e)}
                    options={{ currencyDisable: true }}
                    marker={setAmountMarker}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
}