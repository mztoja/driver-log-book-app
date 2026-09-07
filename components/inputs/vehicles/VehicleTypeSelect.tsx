import { ThemedText } from "@/components/ThemedText";
import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { vehicleTypeEnum } from "@/types";
import { getText } from "@/utils/getText";
import React, { useEffect } from "react";
import { Modal, TouchableOpacity, View, Text } from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const VehicleTypeSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const txt = {
        label: getText('common', 'vehicleType'),
        truck: getText('common', 'vehicleTruck'),
        trailer: getText('common', 'vehicleTrailer'),
    };

    useEffect(() => {
        if (props.value === '') {
            props.onChange(vehicleTypeEnum.truck.toString());
        }
    }, []);

    const current = props.value === vehicleTypeEnum.trailer.toString()
        ? vehicleTypeEnum.trailer
        : vehicleTypeEnum.truck;

    const handleSelect = (type: vehicleTypeEnum): void => {
        props.onChange(type.toString());
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
                        value={current === vehicleTypeEnum.trailer ? txt.trailer : txt.truck}
                        editable={false}
                    />
                </View>
            </TouchableOpacity>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => setModalVisible(false)} />
                    <View style={[STYLES.modaSelectContent, { backgroundColor: colors.background }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                                {getText('common', 'chooseFromList')}
                            </ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => handleSelect(vehicleTypeEnum.truck)}>
                            <Text style={[STYLES.selectItem, { color: colors.text }]}>{txt.truck}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSelect(vehicleTypeEnum.trailer)}>
                            <Text style={[STYLES.selectItem, { color: colors.text }]}>{txt.trailer}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
