import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { extractTime } from "@/utils/extractTime";
import { getText } from "@/utils/getText";
import { useEffect } from "react";
import { View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
    secDriver?: boolean;
    label?: string;
    helperText?: string;
}

export const DriveTimeInput: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();

    const onChange = (v: string): void => {
        props.onChange(extractTime(v));
    }

    useEffect(() => {
        props.onChange(extractTime(props.value));
    }, []);

    return (
        <View>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground, maxWidth: 150, flexDirection: 'row', alignSelf: 'center' }]}
                theme={{
                    colors: {
                        primary: colors.text,
                    }
                }}
                label={props.label ?? (props.secDriver ? getText('common', 'driveTime2') : getText('common', 'driveTime'))}
                value={props.value}
                onChangeText={onChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
            {props.helperText !== '' &&
                <HelperText type="info">
                    {props.helperText ?? (props.secDriver ? getText('common', 'driveTimeHelper2') : getText('common', 'driveTimeHelper'))}
                </HelperText>
            }
        </View>
    );
}