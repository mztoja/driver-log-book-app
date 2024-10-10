import { View, StyleSheet, Image, ScrollView } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { EmailInput } from "@/components/inputs/EmailInput";
import { PasswordInput } from "@/components/inputs/PasswordInput";
import { SwitchTheme } from "@/components/SwitchTheme";
import { SendButton } from "@/components/buttons/SendButton";
import { useSnackbar } from "@/hooks/useSnackbar";


const Login: React.FC = (): JSX.Element => {

    const { colors } = useTheme();
    const { showSnackbar } = useSnackbar();

    return (
        <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]}>
            <View style={{ alignSelf: 'flex-end', padding: 20, marginTop: 20 }}><SwitchTheme /></View>
            <View style={styles.topContainer}>
                <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
                <ThemedText type="title" style={{ marginBottom: 60 }}>{getText('common', 'appName')}</ThemedText>
            </View>
            <View style={styles.formConteiner}>
                <ThemedText type="subtitle" style={{ alignSelf: 'center' }}>{getText('common', "logIn")}</ThemedText>
                <EmailInput />
                <PasswordInput />
                <SendButton onPress={() => showSnackbar('ad', 'error')} text={getText('common', 'logIn')} />
            </View>
            <View style={styles.bottomContainer}>
                <ThemedText type="link">{getText('common', 'register')}</ThemedText>
            </View>
        </ScrollView> 
    );
}

const styles = StyleSheet.create({
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
});

export default Login;