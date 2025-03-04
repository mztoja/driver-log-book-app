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

export const NotesInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const [height, setHeight] = React.useState(0);

    return (
        <View>
            <TextInput
                style={[STYLES.textInput, {
                    backgroundColor: colors.inputBackground,
                    height: Math.max(40, height),
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
                textColor={colors.text}
                placeholderTextColor={colors.text}
                onContentSizeChange={(event) =>
                    setHeight(event.nativeEvent.contentSize.height)
                }
            />
        </View>
    );
};