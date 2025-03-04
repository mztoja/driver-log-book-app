import { ThemedText } from "@/components/ThemedText";
import { STYLES } from "@/constants/STYLES";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useTheme } from "@/hooks/useTheme";
import { userFuelContypeEnum } from "@/types";
import { extractDigits } from "@/utils/extractDigits";
import { extractNumberWithDecimal } from "@/utils/extractNumberWithDecimal";
import { getText } from "@/utils/getText";
import { View } from "react-native";
import { IconButton, TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
    type: 'quantity' | 'combustion';
}

export const FuelInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { user } = useGlobalState();
    const { colors } = useTheme();
    const txt = {
        fuelQuantity: getText('common', 'fuelQuantity'),
        fuelCombustion: getText('common', 'fuelCombustion'),
    };

    const onChange = (v: string): void => {
        if (props.type === 'quantity') {
            props.onChange(extractDigits(v));
        } else {
            props.onChange(extractNumberWithDecimal(v));
        }
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
                label={props.type === 'combustion' ? txt.fuelCombustion : txt.fuelQuantity}
                value={props.value}
                onChangeText={onChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
            <View style={STYLES.iconInputWrapper}>
                <ThemedText>
                    {props.type === 'quantity' ? 'L' :
                        user?.fuelConType === userFuelContypeEnum.per100km ? 'L/100km' : 'L'
                    }
                </ThemedText>
                <IconButton
                    icon="clipboard-edit-outline"
                    size={24}
                    iconColor={colors.actionIcon}
                // onPress={add}
                />
            </View>
        </View>
    );
}