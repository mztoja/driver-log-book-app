import { useRef } from "react";
import { ScrollView } from "react-native";
import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { InfoPanel } from "@/components/InfoPanel";

export default function Info() {

    const { colors } = useTheme();
    const scrollRef = useRef<ScrollView>(null);

    return (
        <ScrollView ref={scrollRef} style={[STYLES.scrollView, { backgroundColor: colors.background }]}>
            {/* rAF: przewijamy po klatce, gdy ScrollView zna już nową wysokość treści */}
            <InfoPanel onDetailsShown={() => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }))} />
        </ScrollView>
    );
}
