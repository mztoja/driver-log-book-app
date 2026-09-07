import React from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';

interface Props {
    label: string;
    value: string;
    onChange: (e: string) => void;
}

export const GpsInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();

    const handleChange = (text: string): void => {
        props.onChange(text.replace(',', '.').replace(/[^0-9.-]/g, ''));
    };

    return (
        <View>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                theme={{ colors: { primary: colors.text } }}
                label={props.label}
                value={props.value}
                onChangeText={handleChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType="numbers-and-punctuation"
            />
        </View>
    );
};
