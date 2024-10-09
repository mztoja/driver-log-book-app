import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';

export const PasswordInput: React.FC = (): JSX.Element => {
    const [text, setText] = useState<string>("");
    const [secure, setSecure] = useState<boolean>(true);
    const { colors } = useTheme();

    return (
        <TextInput
            style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
            theme={{
                colors: {
                    primary: colors.text,
                }
            }}
            label={getText('common', 'password')}
            value={text}
            onChangeText={text => setText(text)}
            textColor={colors.text}
            placeholderTextColor={colors.text}
            secureTextEntry={secure}
            right={
                <TextInput.Icon
                    icon={secure ? "eye-off" : "eye"}
                    color={colors.tabIconDefault}
                    onPress={() => setSecure(!secure)}
                />
            }
        />
    );
};