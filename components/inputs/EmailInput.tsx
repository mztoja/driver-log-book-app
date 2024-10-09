import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { TextInput } from 'react-native-paper';

export const EmailInput: React.FC = (): JSX.Element => {
    const [text, setText] = React.useState("");
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
            value={text}
            onChangeText={text => setText(text)}
            textColor={colors.text}
            placeholderTextColor={colors.text}
        />
    );
};