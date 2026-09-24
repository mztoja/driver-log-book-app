import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { HelperText } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { SendButton } from '@/components/buttons/SendButton';
import { MainFormButton } from '@/components/buttons/MainFormButton';
import ConfirmModal from '@/components/ConfirmModal';
import { FirstNameInput } from '@/components/inputs/user/FirstName';
import { LastNameInput } from '@/components/inputs/user/LastName';
import { BidTypeSelect } from '@/components/inputs/user/BidTypeSelect';
import { AmountInput } from '@/components/inputs/finances/AmountInput';
import { OptionSelect } from '@/components/inputs/commons/OptionSelect';
import { CompanySelect } from '@/components/vehicles/CompanySelect';
import { STYLES } from '@/constants/STYLES';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';
import clearSession from '@/utils/clearSession';
import { UpdateFormInterface, UserInterface, userFuelContypeEnum, userLangEnum } from '@/types';

const formFromUser = (u: UserInterface): UpdateFormInterface => ({
    firstName: u.firstName,
    lastName: u.lastName,
    lang: u.lang.toString(),
    companyId: u.companyId.toString(),
    bidType: u.bidType.toString(),
    bid: u.bid.toString(),
    currency: u.currency,
    fuelConsumptionType: u.fuelConType.toString(),
});

/** Ustawienia profilu – odpowiednik front `ProfileSet` (+ wylogowanie, na froncie w nagłówku). */
export default function Profile() {
    const { colors } = useTheme();
    const { user, setUser, lang, activeTour } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const [form, setForm] = useState<UpdateFormInterface | null>(user ? formFromUser(user) : null);
    const [logoutConfirm, setLogoutConfirm] = useState<boolean>(false);

    // karta może się zamontować zanim dojadą dane użytkownika
    useEffect(() => {
        if (!form && user) setForm(formFromUser(user));
    }, [user, form]);

    if (!user || !form) {
        return <View style={[STYLES.mainView, { backgroundColor: colors.background }]} />;
    }

    const update = (key: keyof UpdateFormInterface, value: string): void => {
        setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    };

    const save = (): void => {
        if (JSON.stringify(form) === JSON.stringify(formFromUser(user))) {
            showSnackbar(getText('common', 'profileNoChanges', lang), 'info');
            return;
        }
        fetchData<UserInterface>(API_ENDPOINTS.userUpdate, { method: 'PATCH', sendData: form }, { showSnackbar })
            .then((res) => {
                if (res.success && res.responseData) {
                    const updated = res.responseData as UserInterface;
                    setUser(updated);
                    setForm(formFromUser(updated));
                    // komunikat już w nowo wybranym języku (jak front: login[responseData.lang])
                    showSnackbar(getText('common', 'profileSaved', updated.lang === userLangEnum.pl ? 'pl' : 'en'), 'success');
                }
            });
    };

    const logout = async (): Promise<void> => {
        setLogoutConfirm(false);
        // jak front handleLogout: wylogowanie po stronie serwera (unieważnia refresh token),
        // potem czyszczenie lokalnej sesji; brak usera przekierowuje do ekranu logowania
        await fetchData(API_ENDPOINTS.logout);
        await clearSession();
        setUser(null);
    };

    return (
        <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
            <ThemedText style={styles.label}>{getText('common', 'email', lang)}</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.email}>{user.email}</ThemedText>

            <OptionSelect
                label={getText('common', 'language', lang)}
                value={form.lang}
                onChange={(e) => update('lang', e)}
                options={[
                    { value: userLangEnum.pl.toString(), label: 'Polski' },
                    { value: userLangEnum.en.toString(), label: 'English' },
                ]}
            />
            <FirstNameInput value={form.firstName} onChange={(e) => update('firstName', e)} />
            <LastNameInput value={form.lastName} onChange={(e) => update('lastName', e)} />
            <CompanySelect value={Number(form.companyId)} onChange={(id) => update('companyId', id.toString())} />
            <BidTypeSelect value={form.bidType} onChange={(e) => update('bidType', e)} />
            <AmountInput
                valueAmount={form.bid}
                onChangeAmount={(e) => update('bid', e)}
                valueCurrency={form.currency}
                onChangeCurrency={(e) => update('currency', e)}
                options={{ amountLabel: getText('common', 'salaryAmount', lang), currencyDisable: !!activeTour }}
            />
            {!!activeTour && <HelperText type="info">{getText('common', 'currencyLockedHelper', lang)}</HelperText>}
            <OptionSelect
                label={getText('common', 'fuelConsumptionType', lang)}
                value={form.fuelConsumptionType}
                onChange={(e) => update('fuelConsumptionType', e)}
                options={[
                    { value: userFuelContypeEnum.liters.toString(), label: getText('common', 'fuelConType1', lang) },
                    { value: userFuelContypeEnum.per100km.toString(), label: getText('common', 'fuelConType2', lang) },
                ]}
            />
            <SendButton onPress={save} text={getText('common', 'profileSave', lang)} loading={loading} />

            <View style={styles.logout}>
                <MainFormButton onPress={() => setLogoutConfirm(true)} text={getText('common', 'logout', lang)} />
            </View>
            <ConfirmModal
                visible={logoutConfirm}
                text={getText('common', 'logoutConfirm', lang)}
                onConfirm={logout}
                onCancel={() => setLogoutConfirm(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    content: { padding: 12, paddingBottom: 40 },
    label: { opacity: 0.7, fontSize: 13 },
    email: { marginBottom: 8 },
    logout: { marginHorizontal: 40, marginTop: 10 },
});
