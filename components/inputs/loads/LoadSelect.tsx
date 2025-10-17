import { ThemedText } from "@/components/ThemedText";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { STYLES } from "@/constants/STYLES";
import { useApi } from "@/hooks/useApi";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useTheme } from "@/hooks/useTheme";
import { LoadInterface } from "@/types";
import { getText } from "@/utils/getText";
import React from "react";
import { Dimensions, FlatList, Modal, TouchableOpacity, View } from "react-native";
import { TextInput, Text } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const LoadSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [displayText, setDisplayText] = React.useState<string>('');

    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const screenHeight = Dimensions.get('window').height;
    const { activeLoads, setActiveLoads } = useGlobalState();
    const txt = {
        loadSelect: getText('home', 'chooseLoad'),
        chooseFromList: getText('common', 'chooseFromList'),
        noReceiver: getText('home', 'noLoadReceiver'),
    };

    React.useEffect(() => {
        (!activeLoads || activeLoads.length === 0) && fetchData<LoadInterface[]>(API_ENDPOINTS.GET_NOT_UNLOADED_LOADS, { setData: setActiveLoads });

        const defaultLoad = activeLoads?.find((load) => load.id === Number(props.value));
        defaultLoad ? handleSelect(defaultLoad) : handleSelect(null);
    }, []);

    const onModalOpen = (): void => {
        setModalVisible(true);
    };

    const handleSelect = (load: LoadInterface | null): void => {
        if (!load) {
            props.onChange('0');
            setDisplayText(txt.chooseFromList);
            return;
        }
        props.onChange(load.id.toString());
        if (load.receiverData) {
            setDisplayText(`${load.description} ${load.weight}kg - ${load.receiverData.country} ${load.receiverData.code} ${load.receiverData.name}`);
        } else {
            setDisplayText(`${load.description} ${load.weight}kg`);
        }
        setModalVisible(false);
    }

    return (
        <View>
            <TouchableOpacity onPress={() => { onModalOpen() }}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{
                        colors: {
                            primary: colors.text,
                        }
                    }}
                    label={txt.loadSelect}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={displayText}
                    editable={false}
                    disabled={loading}
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
                                {txt.chooseFromList}
                            </ThemedText>
                        </View>
                        <FlatList
                            data={activeLoads}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={STYLES.inputWrapper}>
                                    <TouchableOpacity onPress={() => handleSelect(item)}>
                                        {
                                            item.receiverData ?
                                                <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                                    {item.description} {item.weight}kg {item.quantity}{"\n"}
                                                    {item.receiverData.country} - {item.receiverData.code} - {item.receiverData.city} ({item.receiverData.name})
                                                </Text>
                                                :
                                                <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                                    {item.description} {item.weight}kg {item.quantity}{"\n"}
                                                    {txt.noReceiver}
                                                </Text>
                                        }
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}