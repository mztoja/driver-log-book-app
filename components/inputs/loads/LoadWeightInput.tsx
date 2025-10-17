import { ThemedText } from '@/components/ThemedText';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import React from 'react';
import { View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const LoadWeightInput: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();
    const txt = {
        loadWeight: getText('home', 'loadWeight'),
    };
    const [clearVisible, setClearVisible] = React.useState<boolean>(false);

    const clear = (): void => {
        props.onChange('');
    }

    React.useEffect(() => {
        props.value.length > 0 ? setClearVisible(true) : setClearVisible(false);
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
                label={txt.loadWeight}
                value={props.value}
                onChangeText={props.onChange}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
            <View style={STYLES.iconInputWrapper}>
                <IconButton
                    icon="weight-kilogram"
                    size={24}
                    iconColor={colors.tabIconDefault}
                    onPress={clear}
                />
                {clearVisible &&
                    <IconButton
                        icon="close"
                        size={24}
                        iconColor={colors.deleteIcon}
                        onPress={clear}
                    />
                }
            </View>
        </View>
    );
}
