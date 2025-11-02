import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { View } from 'react-native';
import { HelperText, IconButton, TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const ActivityInput: React.FC<Props> = (props: Props) => {
    const { colors } = useTheme();
    const [error, setError] = React.useState<boolean>(false);
    const label = getText('common', 'activity');
    const helper = getText('common', 'activityHelper');
    const [clearVisible, setClearVisible] = React.useState<boolean>(false);

    const clear = (): void => {
        props.onChange('');
    }

    React.useEffect(() => {
        props.value.length > 100 ? setError(true) : setError(false);
    }, [props.value]);

    React.useEffect(() => {
        if (props.value.length > 0) {
            setClearVisible(true);
        } else {
            setClearVisible(false);
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
            <View style={STYLES.iconInputWrapper}>
                {clearVisible &&
                    <IconButton
                        icon="close"
                        size={24}
                        iconColor={colors.deleteIcon}
                        onPress={clear}
                    />
                }
            </View>
            {error &&
                <HelperText type="error" visible={error}>
                    {helper}
                </HelperText>
            }
        </View>
    );
};