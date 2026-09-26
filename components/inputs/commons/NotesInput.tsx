import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import * as React from 'react';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

// Bez `height` w style: Paper przy podanej wysokości przełącza się w tryb stałej wysokości
// (inne paddingi, sztywne `height`), przez co na iOS pole nie rosło. Natywny multiline rośnie sam.
export const NotesInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();

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
                label={getText('common', 'notes')}
                value={props.value}
                onChangeText={props.onChange}
                multiline={true}
                scrollEnabled={false}
                textColor={colors.text}
                placeholderTextColor={colors.text}
            />
        </View>
    );
};
