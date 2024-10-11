import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const PasswordInput: React.FC<Props> = (props: Props): JSX.Element => {
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
            value={props.value}
            onChangeText={props.onChange}
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