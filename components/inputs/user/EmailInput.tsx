import { REG_EXP } from '@/constants/REG_EXP';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
    showHelper?: boolean;
}

export const EmailInput: React.FC<Props> = (props: Props): JSX.Element => {
    const [info, setInfo] = React.useState<boolean>(false);
    const { colors } = useTheme();
    const label = getText('common', 'email');
    const helper = getText('common', 'emailHelper');

    React.useEffect(() => {
        props.value.length < 1 || REG_EXP.email.test(props.value) ? setInfo(false) : setInfo(true);
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
                error={info}
            />
            {props.showHelper && info &&
                <HelperText type="info" visible={info}>
                    {helper}
                </HelperText>
            }
        </View>
    );
};