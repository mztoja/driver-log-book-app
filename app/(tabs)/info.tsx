import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";

export default function Info() {

    const { colors } = useTheme();

    return (
        <View style={[styles.view, { backgroundColor: colors.background }]}>
            <ThemedText>Here we get some info</ThemedText>
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