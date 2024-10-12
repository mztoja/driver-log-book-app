import { View, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { EmailInput } from "@/components/inputs/EmailInput";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import { SwitchTheme } from "@/components/SwitchTheme";
import { SendButton } from "@/components/buttons/SendButton";
import { useSnackbar } from "@/hooks/useSnackbar";
import { LoginFormInterface, UserInterface } from "@/types";
import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useGlobalState } from "@/hooks/useGlobalState";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { SwitchLang } from "@/components/SwitchLang";


const Login: React.FC = (): JSX.Element => {

    const { colors } = useTheme();
    const { showSnackbar } = useSnackbar();
    const { loading, fetchData } = useApi();
    const { setUser } = useGlobalState();

    const [loginForm, setLoginForm] = useState<LoginFormInterface>({
        email: '',
        password: '',
    });

    const updateForm = (key: keyof LoginFormInterface, value: string) => {
        setLoginForm((loginForm: LoginFormInterface) => ({
            ...loginForm,
            [key]: value,
        }));
    };

    const send = (): void => {
        fetchData<UserInterface>(API_ENDPOINTS.LOGIN, { method: 'POST', sendData: loginForm }, { showSnackbar })
            .then((res) => {
                if (res.success && res.responseData) {
                    showSnackbar('Jołjoł', 'success');
                    setUser(res.responseData);
                }
            });
    }

    return (
        <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]}>
            <View style={styles.headerButtons}>
                <SwitchLang style={styles.flagButtons} flagStyle={styles.flagImage} />
                <View><SwitchTheme /></View>
            </View>
            <View style={styles.topContainer}>
                <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
                <ThemedText type="title" style={{ marginBottom: 60 }}>{getText('common', 'appName')}</ThemedText>
            </View>
            <View style={styles.formConteiner}>
                <ThemedText type="subtitle" style={{ alignSelf: 'center' }}>{getText('common', "logIn")}</ThemedText>
                <EmailInput value={loginForm.email} onChange={(e) => updateForm('email', e)} />
                <PasswordInput value={loginForm.password} onChange={(e) => updateForm('password', e)} />
                <SendButton onPress={send} text={getText('common', 'logIn')} loading={loading} />
            </View>
            <View style={styles.bottomContainer}>
                <ThemedText type="link">{getText('common', 'register')}</ThemedText>
            </View>
        </ScrollView> 
    );
}

const styles = StyleSheet.create({
    headerButtons: {
        padding: 20,
        marginTop: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    topContainer: {
        justifyContent: 'center',
        padding: 10,
        alignItems: 'center',
    },
    formConteiner: {
        padding: 10,
        marginHorizontal: 40,
    },
    logo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    bottomContainer: {
        marginTop: 20,
        justifyContent: 'center',
        padding: 10,
        alignItems: 'center',
    },
    flagButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    flagImage: {
        width: 30,
        height: 30,
        marginHorizontal: 5,
        resizeMode: 'contain',
    },
});

export default Login;