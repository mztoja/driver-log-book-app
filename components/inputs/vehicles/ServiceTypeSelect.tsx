import { ThemedText } from "@/components/ThemedText";
import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { serviceTypeEnum } from "@/types";
import { getText } from "@/utils/getText";
import React, { useEffect } from "react";
import { Modal, TouchableOpacity, View, Text } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const ServiceTypeSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const txt = {
        label: getText('common', 'serviceType'),
        maintenance: getText('common', 'serviceMaintenance'),
        service: getText('common', 'serviceService'),
        maintenanceHelper: getText('common', 'serviceMaintenanceHelper'),
        serviceHelper: getText('common', 'serviceServiceHelper'),
    };

    useEffect(() => {
        if (props.value === '') {
            props.onChange(serviceTypeEnum.maintenance.toString());
        }
    }, []);

    const current = props.value === serviceTypeEnum.service.toString()
        ? serviceTypeEnum.service
        : serviceTypeEnum.maintenance;

    const handleSelect = (type: serviceTypeEnum): void => {
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
                        value={current === serviceTypeEnum.service ? txt.service : txt.maintenance}
                        editable={false}
                    />
                </View>
            </TouchableOpacity>
            <HelperText type="info">
                {current === serviceTypeEnum.service ? txt.serviceHelper : txt.maintenanceHelper}
            </HelperText>
            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={STYLES.modalSelectContainer}>
                    <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={() => setModalVisible(false)} />
                    <View style={[STYLES.modaSelectContent, { backgroundColor: colors.background }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                                {getText('common', 'chooseFromList')}
                            </ThemedText>
                        </View>
                        <TouchableOpacity onPress={() => handleSelect(serviceTypeEnum.maintenance)}>
                            <Text style={[STYLES.selectItem, { color: colors.text }]}>{txt.maintenance}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleSelect(serviceTypeEnum.service)}>
                            <Text style={[STYLES.selectItem, { color: colors.text }]}>{txt.service}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
