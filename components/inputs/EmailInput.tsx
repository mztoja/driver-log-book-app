import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const EmailInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();

    return (
        <TextInput
            style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
            theme={{
                colors: {
                    primary: colors.text,
                }
            }}
            label={getText('common', 'email')}
            value={props.value}
            onChangeText={props.onChange}
            textColor={colors.text}
            placeholderTextColor={colors.text}
        />
    );
};