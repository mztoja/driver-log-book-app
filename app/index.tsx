import { View, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import LoginInput from "@/components/inputs/LoginInput";
import PasswordInput from "@/components/inputs/PasswordInput";
import { SwitchTheme } from "@/components/SwitchTheme";


const Login = () => {

    const { colors } = useTheme();

    return (
        <View style={[STYLES.mainView, { backgroundColor: colors.background }]}>
            <View style={{ alignSelf: 'flex-end', padding: 10 }}><SwitchTheme /></View>
            <View style={styles.topContainer}>
                <Image source={require('@/assets/images/icon.png')} style={styles.logo} />
                <ThemedText type="title">{getText('common', 'appName')}</ThemedText>
            </View>
            <View style={styles.formConteiner}>
                <ThemedText type="subtitle">{getText('common', "logIn")}</ThemedText>
                <LoginInput />
                <PasswordInput />
            </View>
            <View style={styles.bottomContainer}>
                <ThemedText>Blablabla</ThemedText>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    topContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        padding: 10,
        alignItems: 'center',
    },
    formConteiner: {
        flex: 1,
        alignItems: 'center',
        padding: 10,
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        padding: 20,
    },
    logo: {
        width: 100, // Szerokość logo
        height: 100, // Wysokość logo
        resizeMode: 'contain', // Umożliwia skalowanie logo
        marginBottom: 10, // Odstęp poniżej logo
    }
});

export default Login;