import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { getText } from "@/utils/getText";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
    vehicle: 'truck' | 'trailer' | 'vehicle';
}

export const RegNumberInput: React.FC<Props> = (props: Props) => {
    const [error, setError] = useState<boolean>(false);
    const { colors } = useTheme();
    const text = {
        truck: getText('common', 'truck'),
        trailer: getText('common', 'trailer'),
        vehicle: getText('common', 'vehicleInput'),
    }

    const label = useMemo(() => {
        if (props.vehicle === 'truck') {
            return text.truck;
        } else if (props.vehicle === 'trailer') {
            return text.trailer;
        } else {
            return text.vehicle;
        }
    }, [props.vehicle]);

    useEffect(() => {
        if ((props.value.length <= 10) || (props.value === '')) {
            setError(false);
        } else {
            setError(true);
        }
    }, [props.value]);

    return (
        <View style={STYLES.inputWrapper}>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                theme={{
                    colors: {
                        primary: colors.text,
                    }
                }}
                label={label}
                value={props.value}
                onChangeText={props.onChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                error={error}
            />
        </View>
    );
}