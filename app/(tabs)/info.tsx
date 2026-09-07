import { ScrollView } from "react-native";
import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { InfoPanel } from "@/components/InfoPanel";

export default function Info() {

    const { colors } = useTheme();

    return (
        <ScrollView style={[STYLES.scrollView, { backgroundColor: colors.background }]}>
            <InfoPanel />
        </ScrollView>
    );
}
