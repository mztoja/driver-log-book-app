import React, { useState } from 'react';
import { View, Modal, FlatList, TouchableOpacity, Text, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { ThemedText } from '@/components/ThemedText';
import { CommonInterface } from '@/types';

interface Props {
    value: string;
    onChange: (e: string) => void;
    // gdy true, dołącza opcję "Wszystkie" o wartości '999' (filtr listy)
    displayAll?: boolean;
    label?: string;
}

const TYPE_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8'] as const;

const typeLabel = (value: string, lang: 'pl' | 'en'): string => {
    if (value === '999') return getText('common', 'placeTypeAll', lang);
    return getText('common', `placeType${value}` as keyof CommonInterface['en'], lang);
};

export const PlaceTypeSelect: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const screenHeight = Dimensions.get('window').height;

    const options = props.displayAll ? ['999', ...TYPE_VALUES] : [...TYPE_VALUES];

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{ colors: { primary: colors.text } }}
                    label={props.label ?? getText('common', 'placeType', lang)}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={typeLabel(props.value || (props.displayAll ? '999' : '0'), lang)}
                    editable={false}
                />
            </TouchableOpacity>

            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => setModalVisible(false)} />
                    <View style={[STYLES.modaSelectContent, { backgroundColor: colors.background, height: screenHeight * 0.5 }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                                {getText('common', 'chooseFromList', lang)}
                            </ThemedText>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        props.onChange(item);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{typeLabel(item, lang)}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};
