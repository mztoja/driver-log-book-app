import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { extractNumberWithDecimal } from '@/utils/extractNumberWithDecimal';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
    marker?: Dispatch<SetStateAction<boolean>>;
}

export const UnitPriceInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const label = getText('home', 'expenseUnitPrice');

    const changeValue = (v: string): void => {
        const newValue = extractNumberWithDecimal(v);
        props.onChange(newValue);
        props.marker && props.marker(prev => !prev);
    }


    return (
        <View style={STYLES.inputWrapper}>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground, maxWidth: 150 }]}
                theme={{
                    colors: {
                        primary: colors.text,
                    }
                }}
                label={label}
                value={props.value}
                onChangeText={(e) => changeValue(e)}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
        </View>
    );
};