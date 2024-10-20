import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const StreetInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const [error, setError] = React.useState<boolean>(false);
    const label = getText('common', 'street');
    const helper = getText('common', 'streetHelper');

    React.useEffect(() => {
        props.value.length > 50 ? setError(true) : setError(false);
    }, [props.value]);

    return (
        <View>
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
            {error &&
                <HelperText type="error" visible={error}>
                    {helper}
                </HelperText>
            }
        </View>
    );
};