import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { getText } from "@/utils/getText";
import { View } from "react-native";
import { HelperText, IconButton, TextInput } from "react-native-paper";
import { ThemedText } from "../../ThemedText";
import { useEffect, useRef, useState } from "react";
import { formatOdometer } from "@/utils/formats/formatOdometer";
import { useGlobalState } from "@/hooks/useGlobalState";

interface Props {
    value: string;
    onChange: (e: string) => void;
    disableHelper?: boolean;
}

export const OdometerInput: React.FC<Props> = (props: Props) => {
    const { colors } = useTheme();
    const [clearVisible, setClearVisible] = useState<boolean>(false);
    const { lastLog } = useGlobalState();
    const initialValue = useRef(lastLog?.odometer);
    const [distanceFromPrev, setDistanceFromPrev] = useState<number>(0);
    const text = {
        label: getText('common', 'odometer'),
        helper: getText('common', 'odometerHelper'),
    }

    useEffect(() => {
        if (Number(props.value) > 0) {
            setClearVisible(true);
        } else {
            setClearVisible(false);
        }
        if (lastLog) {
            setDistanceFromPrev(Number(props.value) - Number(initialValue.current));
        } else {
            setDistanceFromPrev(0);
        }
    }, [props.value]);

    const clear = (): void => {
        props.onChange('');
    }

    const add = (): void => {
        const newValue = Number(props.value) + 1;
        props.onChange(newValue.toString());
    }

    return (
        <View style={STYLES.inputWrapper}>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                theme={{
                    colors: {
                        primary: colors.text,
                    }
                }}
                label={text.label}
                value={props.value}
                onChangeText={props.onChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
            <View style={STYLES.iconInputWrapper}>
                <ThemedText>km</ThemedText>
                {clearVisible &&
                    <IconButton
                        icon="close"
                        size={24}
                        iconColor={colors.deleteIcon}
                        onPress={clear}
                    />
                }
                <IconButton
                    icon="plus"
                    size={24}
                    iconColor={colors.actionIcon}
                    onPress={add}
                />
            </View>
            {distanceFromPrev > 0 && !props.disableHelper &&
                <HelperText type='info'>{text.helper}: {formatOdometer(distanceFromPrev)}</HelperText>
            }
        </View>
    );
}