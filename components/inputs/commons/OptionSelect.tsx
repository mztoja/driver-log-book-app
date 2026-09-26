import React, { JSX, useState } from 'react';
import { View, Modal, FlatList, TouchableOpacity, Text, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { ThemedText } from '@/components/ThemedText';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
export interface SelectOption {
    value: string;
    label: string;
}

interface Props {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
}

/** Prosty select z listą w modalu (styl jak pozostałe selecty aplikacji). */
export const OptionSelect: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    // okno wysuwane od dołu – margines nad systemowymi przyciskami (edge-to-edge)
    const bottomInset = useSafeAreaInsets().bottom;
    const { lang } = useGlobalState();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const screenHeight = Dimensions.get('window').height;
    const current = props.options.find((o) => o.value === props.value);

    return (
        <View>
            <TouchableOpacity onPress={() => !props.disabled && setModalVisible(true)}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{ colors: { primary: colors.text } }}
                    label={props.label}
                    textColor={props.disabled ? colors.disabledIcon : colors.text}
                    placeholderTextColor={colors.text}
                    value={current?.label ?? ''}
                    editable={false}
                />
            </TouchableOpacity>
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => setModalVisible(false)} />
                    <View style={[STYLES.modaSelectContent, { paddingBottom: 10 + bottomInset, backgroundColor: colors.background, maxHeight: screenHeight * 0.5 }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                                {getText('common', 'chooseFromList', lang)}
                            </ThemedText>
                        </View>
                        <FlatList
                            // lista mieści się w oknie i przewija w środku – bez tego rośnie do pełnej
                            // wysokości treści i wypycha resztę okna pod systemowe przyciski
                            style={{ flexShrink: 1 }}
                            data={props.options}
                            keyExtractor={(o) => o.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        props.onChange(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{item.label}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};
