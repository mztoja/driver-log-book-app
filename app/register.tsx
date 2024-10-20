import { EmailInput } from "@/components/inputs/user/EmailInput";
import { PasswordInput } from "@/components/inputs/user/PasswordInput";
import { PostCodeInput } from "@/components/inputs/address/PostCodeInput";
import { CompanyNameInput } from "@/components/inputs/address/CompanyNameInput";
import { StreetInput } from "@/components/inputs/address/StreetInput";
import { STYLES } from "@/constants/STYLES";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useTheme } from "@/hooks/useTheme";
import { RegisterFormInterface, userFuelContypeEnum, userLangEnum } from "@/types";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { CityInput } from "@/components/inputs/address/CityInput";
import { CountrySelect } from "@/components/inputs/address/CountrySelect";
import { ThemedText } from "@/components/ThemedText";
import { getText } from "@/utils/getText";
import { FirstNameInput } from "@/components/inputs/user/FirstName";
import { LastNameInput } from "@/components/inputs/user/LastName";
import { DefaultCustomerInput } from "@/components/inputs/user/DefaultCustomerInput";
import { SendButton } from "@/components/buttons/SendButton";
import { AmountInput } from "@/components/inputs/finances/AmountInput";
import { BidTypeSelect } from "@/components/inputs/user/BidTypeSelect";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useSnackbar } from "@/hooks/useSnackbar";
import { router } from 'expo-router';

const Register: React.FC = (): JSX.Element => {

    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { loading, fetchData } = useApi();
    const { showSnackbar } = useSnackbar();

    const [registerForm, setRegisterForm] = useState<RegisterFormInterface>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        lang: userLangEnum[lang].toString(),
        companyName: '',
        companyStreet: '',
        companyPostCode: '',
        companyCity: '',
        country: '',
        defaultCustomer: '',
        bidType: '',
        bid: '',
        currency: '',
        fuelConsumptionType: userFuelContypeEnum.liters.toString(),
    });

    const updateForm = (key: keyof RegisterFormInterface, value: string) => {
        setRegisterForm((registerForm: RegisterFormInterface) => ({
            ...registerForm,
            [key]: value,
        }));
    };

    const send = (): void => {
        fetchData(API_ENDPOINTS.REGISTER, { method: 'POST', sendData: registerForm }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(getText('common', 'registerSuccess', lang), 'success');
                    router.push('/');
                }
            });
    }

    return (
        <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]}>
            <View style={{ borderTopWidth: 1, borderBottomWidth: 1 }}>
                <ThemedText
                    style={{ alignSelf: 'center' }}
                    type="subtitle"
                >
                    {getText('common', 'loginDetails')}
                </ThemedText>
            </View>
            <EmailInput
                value={registerForm.email}
                onChange={(e) => updateForm('email', e)}
                showHelper
            />
            <PasswordInput
                value={registerForm.password}
                onChange={(e) => updateForm('password', e)}
                showHelper
            />
            <View style={{ borderTopWidth: 1, borderBottomWidth: 1 }}>
                <ThemedText
                    style={{ alignSelf: 'center' }}
                    type="subtitle"
                >
                    {getText('common', 'companyDetails')}
                </ThemedText>
            </View>
            <CompanyNameInput
                value={registerForm.companyName}
                onChange={(e) => updateForm('companyName', e)}
            />
            <StreetInput
                value={registerForm.companyStreet}
                onChange={(e) => updateForm('companyStreet', e)}
            />
            <PostCodeInput
                value={registerForm.companyPostCode}
                onChange={(e) => updateForm('companyPostCode', e)}
            />
            <CityInput
                value={registerForm.companyCity}
                onChange={(e) => updateForm('companyCity', e)}
            />
            <CountrySelect
                value={registerForm.country}
                onChange={(e) => updateForm('country', e)}
            />
            <View style={{ borderTopWidth: 1, borderBottomWidth: 1, marginBottom: 10 }}>
                <ThemedText
                    style={{ alignSelf: 'center' }}
                    type="subtitle"
                >
                    {getText('common', 'additionalData')}
                </ThemedText>
            </View>
            <View style={{ marginVertical: 20, marginLeft: 10 }}>
                <ThemedText
                    style={{ alignSelf: 'center' }}
                >
                    {getText('common', 'additionalDataDescription')}
                </ThemedText>
            </View>
            <FirstNameInput
                value={registerForm.firstName}
                onChange={(e) => updateForm('firstName', e)}
            />
            <LastNameInput
                value={registerForm.lastName}
                onChange={(e) => updateForm('lastName', e)}
            />
            <DefaultCustomerInput
                value={registerForm.defaultCustomer}
                onChange={(e) => updateForm('defaultCustomer', e)}
            />
            <BidTypeSelect
                value={registerForm.bidType}
                onChange={(e) => updateForm('bidType', e)}
            />
            <AmountInput
                valueAmount={registerForm.bid}
                onChangeAmount={(e) => updateForm('bid', e)}
                valueCurrency={registerForm.currency}
                onChangeCurrency={(e) => updateForm('currency', e)}
                options={{ amountLabel: getText('common', 'salaryAmount') }}
            />
            <SendButton onPress={send} text={getText('common', 'createAccount')} loading={loading} />
        </ScrollView>
    );
}
export default Register;