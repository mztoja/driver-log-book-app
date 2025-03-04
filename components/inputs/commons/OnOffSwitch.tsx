import { ThemedText } from "@/components/ThemedText";
import { getText } from "@/utils/getText";
import { useEffect, useState } from "react";
import { StyleSheet, Pressable } from "react-native";
import { Switch } from "react-native-paper";

interface Props {
    value: 'true' | 'false';
    onChange: (e: string) => void;
    label: string;
}

export const OnOffSwitch: React.FC<Props> = (props: Props): JSX.Element => {
    const [isSwitchOn, setIsSwitchOn] = useState<boolean>(props.value === 'true' ? true : false);
    const text = {
        yes: ' (' + getText('common', 'yes') + ')',
        no: ' (' + getText('common', 'no') + ')',
    }

    const onToggleSwitch = (): void => setIsSwitchOn(!isSwitchOn);

    useEffect(() => {
        isSwitchOn ? props.onChange('true') : props.onChange('false');
    }, [isSwitchOn]);

    return (
        <Pressable onPress={onToggleSwitch} style={styles.container}>
            <ThemedText>{isSwitchOn ? props.label + text.yes : props.label + text.no}</ThemedText>
            <Switch
                value={isSwitchOn}
                onValueChange={onToggleSwitch}
            />
        </Pressable>
    );
};
const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: 'center',
    },
});