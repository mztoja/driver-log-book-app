import { ThemedText } from '@/components/ThemedText';
import { STYLES } from '@/constants/STYLES';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import { useEffect, useState } from 'react';
import { Dimensions, FlatList, Modal, TouchableOpacity, View, Text } from 'react-native';
import { TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

interface Option {
    value: string;
    text: string;
}

export const BidTypeSelect: React.FC<Props> = (props: Props): JSX.Element => {
    const [textValue, setTextValue] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const screenHeight = Dimensions.get('window').height;

    const options: Option[] = [
        { value: '0', text: getText('common', 'bidType0') },
        { value: '1', text: getText('common', 'bidType1') },
        { value: '2', text: getText('common', 'bidType2') },
        { value: '3', text: getText('common', 'bidType3') },
    ];

    const handleSelect = (value: Option): void => {
        props.onChange(value.value);
        setModalVisible(false);
        setTextValue(value.text);
    }

    useEffect(() => {
        switch (props.value) {
            case '0':
                setTextValue(getText('common', 'bidType0', lang));
                break;
            case '1':
                setTextValue(getText('common', 'bidType1', lang));
                break;
            case '2':
                setTextValue(getText('common', 'bidType2', lang));
                break;
            case '3':
                setTextValue(getText('common', 'bidType3', lang));
                break;
            default:
                setTextValue(getText('common', 'bidType0', lang));
                props.onChange('0');
                break;
        }
    }, []);

    return (
        <View>
            <TouchableOpacity onPress={() => { setModalVisible(true) }}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{
                        colors: {
                            primary: colors.text,
                        }
                    }}
                    label={getText('common', 'bidType')}
                    value={textValue}
                    onChangeText={props.onChange}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    editable={false}
                />
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => { setModalVisible(false) }} />
                    <View style={[STYLES.modaSelectContent, { backgroundColor: colors.background, height: screenHeight * 0.5 }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText
                                style={{ alignSelf: 'center' }}
                                type="subtitle"
                            >
                                {getText('common', 'chooseFromList')}
                            </ThemedText>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleSelect(item)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{item.text}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};