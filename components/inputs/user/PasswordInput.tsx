import { REG_EXP } from '@/constants/REG_EXP';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import React from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
    showHelper?: boolean;
}

export const PasswordInput: React.FC<Props> = (props: Props): JSX.Element => {
    const [secure, setSecure] = React.useState<boolean>(true);
    const [info, setInfo] = React.useState<boolean>(false);
    const { colors } = useTheme();
    const label = getText('common', 'password');
    const helper = getText('common', 'passwordHelper');

    React.useEffect(() => {
        props.value.length < 1 || REG_EXP.password.test(props.value) ? setInfo(false) : setInfo(true);
    }, [props.value]);

    return (
        <View>
            <TextInput
                style={[STYLES.textInput, {
                    backgroundColor: colors.inputBackground,
                }]}
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
                secureTextEntry={secure}
                error={info}
                right={
                    <TextInput.Icon
                        icon={secure ? "eye-off" : "eye"}
                        color={colors.tabIconDefault}
                        onPress={() => setSecure(!secure)}
                    />
                }
            />
            {props.showHelper && info &&
                <HelperText type="info" visible={info}>
                    {helper}
                </HelperText>
            }
        </View>
    );
};