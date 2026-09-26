import React, { JSX, useEffect, useState } from 'react';
import { View, Modal, FlatList, TouchableOpacity, Text, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useApi } from '@/hooks/useApi';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { ThemedText } from '@/components/ThemedText';
import { PlaceInterface } from '@/types';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface Props {
    // id firmy (miejsca-bazy), do której przypisane są pojazdy
    value: number;
    onChange: (id: number) => void;
}

/** Odpowiednik front `CompanySelect` – filtr pojazdów po firmie (lista `/places/companyList`). */
export const CompanySelect: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    // okno wysuwane od dołu – margines nad systemowymi przyciskami (edge-to-edge)
    const bottomInset = useSafeAreaInsets().bottom;
    const { lang } = useGlobalState();
    const { fetchData } = useApi();
    const [companies, setCompanies] = useState<PlaceInterface[]>([]);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const screenHeight = Dimensions.get('window').height;

    useEffect(() => {
        fetchData<PlaceInterface[]>(API_ENDPOINTS.getCompanyList).then((res) => {
            if (Array.isArray(res.responseData)) setCompanies(res.responseData);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const label = (c: PlaceInterface): string => `${c.name}${c.city ? ` - ${c.city}` : ''}`;
    const selected = companies.find((c) => c.id === props.value);

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{ colors: { primary: colors.text } }}
                    label={getText('vehicles', 'company', lang)}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={selected ? label(selected) : ''}
                    editable={false}
                />
            </TouchableOpacity>
            <Modal animationType="slide" transparent visible={modalVisible}>
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => setModalVisible(false)} />
                    <View style={[STYLES.modaSelectContent, { paddingBottom: 10 + bottomInset, backgroundColor: colors.background, height: screenHeight * 0.5 }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                                {getText('common', 'chooseFromList', lang)}
                            </ThemedText>
                        </View>
                        <FlatList
                            // lista mieści się w oknie i przewija w środku – bez tego rośnie do pełnej
                            // wysokości treści i wypycha resztę okna pod systemowe przyciski
                            style={{ flexShrink: 1 }}
                            data={companies}
                            keyExtractor={(c) => c.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        props.onChange(item.id);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{label(item)}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};
