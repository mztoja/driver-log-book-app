import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { getText } from "@/utils/getText";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { HelperText, IconButton, TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
    disabled?: boolean;
}

export const ServiceEntryInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const [error, setError] = useState<boolean>(false);
    const label = getText('common', 'serviceEntry');

    useEffect(() => {
        setError(props.value.length > 200);
    }, [props.value]);

    return (
        <View style={STYLES.inputWrapper}>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                theme={{ colors: { primary: colors.text } }}
                label={label}
                value={props.value}
                onChangeText={props.onChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                error={error}
                disabled={props.disabled}
            />
            {!props.disabled && props.value.length > 0 &&
                <View style={STYLES.iconInputWrapper}>
                    <IconButton
                        icon="close"
                        size={24}
                        iconColor={colors.deleteIcon}
                        onPress={() => props.onChange('')}
                    />
                </View>
            }
            {error &&
                <HelperText type="error" visible={error}>
                    {label}
                </HelperText>
            }
        </View>
    );
};
