import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { router } from "expo-router";
import { common } from "@/assets/text/common";
import { useGlobalState } from "@/hooks/useGlobalState";

export default function NotFound() {
    const { colors } = useTheme();
    const { user } = useGlobalState();

    const goBack = () => {
        if (user) {
            router.push('/home');
        } else {
            router.push('/');
        }

    }

    return (
        <View style={[styles.view, { backgroundColor: colors.background }]}>
            <Pressable onPress={goBack}><ThemedText type="link">{common.pl.goToMainPage}</ThemedText></Pressable>
        </View>
    );
}
const styles = StyleSheet.create({
    view: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    }
});
