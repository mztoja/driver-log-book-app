import { ThemedText } from "@/components/ThemedText";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { STYLES } from "@/constants/STYLES";
import { useApi } from "@/hooks/useApi";
import { useTheme } from "@/hooks/useTheme";
import { VehicleInterface } from "@/types";
import { getText } from "@/utils/getText";
import React from "react";
import { Dimensions, Modal, TouchableOpacity, View, Text, FlatList } from "react-native";
import { TextInput } from "react-native-paper";

interface Props {
    value: string;
    onChange: (e: string) => void;
    truck: string;
    trailer: string | null;
}

enum state {
    notFound = 0,
    loadable = 1,
    unloadable = 2,
}

export const LoadOnVehicleSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [truckState, setTruckState] = React.useState<number>(state.notFound);
    const [trailerState, setTrailerState] = React.useState<number>(state.notFound);
    const [truckData, setTruckData] = React.useState<VehicleInterface | null>(null);
    const [trailerData, setTrailerData] = React.useState<VehicleInterface | null>(null);


    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const screenHeight = Dimensions.get('window').height;
    const txt = {
        loadedVehicle: getText('home', 'loadedVehicle'),
        chooseFromList: getText('common', 'chooseFromList'),
        detailsNotFound: getText('home', 'vehicleDetailsNotFound'),
    };

    const onModalOpen = (): void => {
        setModalVisible(true);
    };

    const handleSelect = (vehicle: string): void => {
        props.onChange(vehicle);
        setModalVisible(false);
    }

    React.useEffect(() => {
        props.truck.length > 3 &&
            fetchData<VehicleInterface>(API_ENDPOINTS.GET_VEHICLE_BY_REG + '/' + props.truck, { setData: setTruckData });

        props.trailer && props.trailer?.length > 3 &&
            fetchData<VehicleInterface>(API_ENDPOINTS.GET_VEHICLE_BY_REG + '/' + props.trailer, { setData: setTrailerData });
    }, []);

    React.useEffect(() => {
        if (!truckData) {
            setTruckState(state.notFound);
        } else {
            if (truckData.isLoadable) {
                setTruckState(state.loadable);
                props.value === '' && props.onChange(props.truck);
            } else {
                setTruckState(state.unloadable);
            }
        }
    }, [truckData]);

    React.useEffect(() => {
        if (!trailerData) {
            setTrailerState(state.notFound);
        } else {
            if (trailerData.isLoadable) {
                setTrailerState(state.loadable);
                props.value === '' && props.trailer && props.onChange(props.trailer);
            } else {
                setTrailerState(state.unloadable);
            }
        }
    }, [trailerData]);

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
                    label={txt.loadedVehicle}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={props.value}
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
                        {truckState === state.notFound &&
                            <View style={STYLES.inputWrapper}>
                                <TouchableOpacity onPress={() => handleSelect(props.truck)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                        {props.truck} ({txt.detailsNotFound})
                                    </Text>
                                </TouchableOpacity>
                                <View style={STYLES.iconInputWrapper}></View>
                            </View>
                        }
                        {truckState === state.loadable &&
                            <View style={STYLES.inputWrapper}>
                                <TouchableOpacity onPress={() => handleSelect(props.truck)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                        {props.truck}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {truckState === state.unloadable &&
                            <View style={STYLES.inputWrapper}>
                                <Text style={[STYLES.selectItem, { color: colors.disabledIcon }]}>
                                    {props.truck}
                                </Text>
                            </View>
                        }
                        {props.trailer && trailerState === state.notFound &&
                            <View style={STYLES.inputWrapper}>
                                <TouchableOpacity onPress={() => handleSelect(props.trailer as string)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                        {props.trailer} ({txt.detailsNotFound})
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {props.trailer && trailerState === state.loadable &&
                            <View style={STYLES.inputWrapper}>
                                <TouchableOpacity onPress={() => handleSelect(props.trailer as string)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                        {props.trailer}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        }
                        {props.trailer && trailerState === state.unloadable &&
                            <View style={STYLES.inputWrapper}>
                                <Text style={[STYLES.selectItem, { color: colors.disabledIcon }]}>
                                    {props.trailer}
                                </Text>
                            </View>
                        }
                        <FlatList
                            data={[]}
                            renderItem={() => (<></>)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
