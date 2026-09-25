import { ThemedText } from "@/components/ThemedText";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { STYLES } from "@/constants/STYLES";
import { useApi } from "@/hooks/useApi";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useTheme } from "@/hooks/useTheme";
import { VehicleInterface, vehicleTypeEnum } from "@/types";
import { getText } from "@/utils/getText";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, TouchableOpacity, View, Text } from "react-native";
import { TextInput } from "react-native-paper";

import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface Props {
    value: string;
    onChange: (e: string) => void;
    vehicleType: vehicleTypeEnum;
    currentRegistration?: string | null;
    // numer rejestracyjny wybranego pojazdu (jak front) – np. do treści wpisu serwisowego
    onRegistrationChange?: (registration: string) => void;
}

export const VehicleRegistrationSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();

    // okno wysuwane od dołu – margines nad systemowymi przyciskami (edge-to-edge)

    const bottomInset = useSafeAreaInsets().bottom;
    const { user } = useGlobalState();
    const { fetchData, loading } = useApi();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [data, setData] = useState<VehicleInterface[] | null>(null);
    const txt = {
        label: getText('common', 'registrationPlate'),
    };

    useEffect(() => {
        setData(null);
        props.onChange('');
        const endpoint = props.vehicleType === vehicleTypeEnum.trailer
            ? API_ENDPOINTS.getTrailersList
            : API_ENDPOINTS.getTrucksList;
        fetchData<VehicleInterface[]>(endpoint, { setData }).then((res) => {
            if (res.success && res.responseData && props.currentRegistration) {
                const match = res.responseData.find((v) => (
                    v.companyId === user?.companyId && v.registrationNr === props.currentRegistration
                ));
                if (match) props.onChange(match.id.toString());
            }
        });
        // eslint-disable-next-line
    }, [props.vehicleType]);

    const list = (data ?? []).filter((v) => v.companyId === user?.companyId);
    const selected = list.find((v) => v.id.toString() === props.value);

    useEffect(() => {
        props.onRegistrationChange?.(selected ? selected.registrationNr : '');
        // eslint-disable-next-line
    }, [selected?.registrationNr]);

    const handleSelect = (id: number): void => {
        props.onChange(id.toString());
        setModalVisible(false);
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={STYLES.inputWrapper}>
                    <TextInput
                        style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                        theme={{ colors: { primary: colors.text } }}
                        label={txt.label}
                        textColor={colors.text}
                        placeholderTextColor={colors.text}
                        value={selected ? selected.registrationNr : ''}
                        editable={false}
                        disabled={loading}
                    />
                </View>
            </TouchableOpacity>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => setModalVisible(false)} />
                    <View style={[STYLES.modaSelectContent, { paddingBottom: 10 + bottomInset, backgroundColor: colors.background }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                                {getText('common', 'chooseFromList')}
                            </ThemedText>
                        </View>
                        {loading
                            ? <ActivityIndicator color={colors.text} />
                            : <FlatList
                                data={list}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => handleSelect(item.id)}>
                                        <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                            {item.registrationNr}{item.model ? ` (${item.model})` : ''}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        }
                    </View>
                </View>
            </Modal>
        </View>
    );
};
