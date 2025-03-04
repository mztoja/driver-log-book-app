import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { Dimensions, FlatList, KeyboardAvoidingView, Modal, TouchableOpacity, View, Text, Alert } from "react-native";
import { TextInput } from "react-native-paper";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { useEffect, useState } from "react";
import { BorderInterface } from "@/types";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useGlobalState } from "@/hooks/useGlobalState";
import { PlaceInput } from "./PlaceInput";

interface Props {
    place: string;
    placeOnChange: (e: string) => void;
    country: string;
    countryOnChange: (e: string) => void;
    addNewBorderChange: (e: string) => void;
}

export const BorderSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const { user, lang } = useGlobalState();
    const txtChoose = getText('home', 'crossBorderSwitchToChoose');
    const txtAdd = getText('home', 'crossBorderSwitchToAdd');
    const txtYouAre = getText('home', 'crossBorderYouAre', lang, user?.country);
    const textConfirmation = getText('common', 'confirmation');
    const textconfirmationDeleteElement = (x: string) => getText('common', 'confirmationDeleteElement', lang, x);
    const textCancel = getText('common', 'cancel');
    const textDelete = getText('common', 'delete');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [addNew, setAddNew] = useState<boolean>(false);
    const [searchText, setSearchText] = useState<string>('');
    const [borders, setBorders] = useState<BorderInterface[] | null>(null);
    const [filteredBorders, setFilteredBorders] = useState<BorderInterface[]>([]);
    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const screenHeight = Dimensions.get('window').height;

    const onModalOpen = (): void => {
        setModalVisible(true);
        handleSearch('');
        props.countryOnChange('');
        props.placeOnChange('');
    }

    const handleSearch = (search: string): void => {
        setSearchText(search);
        const sanitizedSearch = search.toLowerCase();
        const filteredList = borders?.filter(border => {
            const place = border.place.toLowerCase();
            return (
                place.includes(sanitizedSearch)
            );
        });

        if (search.length < 1) {
            setFilteredBorders(borders ? borders : []);
        } else {
            setFilteredBorders(filteredList ? filteredList : []);
        }
    };

    const handleBorderSelect = (border: BorderInterface): void => {
        const text: string = border.country1 === user?.country ?
            border.place + ': ' + border.country1 + ' > ' + border.country2 :
            border.place + ': ' + border.country2 + ' > ' + border.country1;
        setSearchText(text);
        props.addNewBorderChange('false');
        props.countryOnChange(border.country1 === user?.country ? border.country2 : border.country1);
        props.placeOnChange(border.place);
        setModalVisible(false);
    }

    useEffect(() => {
        fetchData<BorderInterface[]>(API_ENDPOINTS.GET_BORDERS_BY_COUNTRY + '/' + user?.country, { setData: setBorders }).then();
    }, []);

    useEffect(() => {
        addNew ? props.addNewBorderChange('true') : props.addNewBorderChange('false');
    }, [addNew]);

    const handleBorderDelete = (border: BorderInterface) => {
        Alert.alert(textConfirmation, textconfirmationDeleteElement(border.place),
            [
                {
                    text: textCancel,
                },
                {
                    text: textDelete,
                    onPress: () => {
                        fetchData(API_ENDPOINTS.DELETE_BORDER_CROSS, { sendData: { id: border.id }, method: 'DELETE' }).then((res) => {
                            if (res.success) {
                                setFilteredBorders(filteredBorders.filter(b => b.id !== border.id));
                                if (borders) setBorders(borders.filter(b => b.id !== border.id));
                            }
                        });
                    },
                }
            ],
            { cancelable: false }
        );
    };

    return (
        <View>
            {addNew ?
                <View>
                    <ThemedText>
                        {txtYouAre}
                    </ThemedText>
                    <PlaceInput
                        place={props.place}
                        placeId='0'
                        onChange={(e) => props.placeOnChange(e)}
                        onChangeId={() => { }}
                        country={props.country}
                        onChangeCountry={(e) => props.countryOnChange(e)}
                        options={{ withoutPlaceId: true }}
                    />
                </View>
                :
                <TouchableOpacity onPress={() => { onModalOpen() }}>
                    <TextInput
                        style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                        theme={{
                            colors: {
                                primary: colors.text,
                            }
                        }}
                        label={getText('home', 'border')}
                        textColor={colors.text}
                        placeholderTextColor={colors.text}
                        value={searchText}
                        editable={false}
                    />
                </TouchableOpacity>
            }

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
                            data={filteredBorders.sort((a, b) => {
                                if (a.place < b.place) return -1;
                                if (a.place > b.place) return 1;
                                return 0;
                            })}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => {
                                const display: string = item.country1 === user?.country ?
                                    item.place + ': ' + item.country1 + ' > ' + item.country2 :
                                    item.place + ': ' + item.country2 + ' > ' + item.country1;
                                return (
                                    <TouchableOpacity
                                        onPress={() => handleBorderSelect(item)}
                                        onLongPress={() => handleBorderDelete(item)}
                                    >
                                        <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                            {display}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <KeyboardAvoidingView style={{ backgroundColor: colors.inputBackground }}>
                            <TextInput
                                style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                                theme={{
                                    colors: {
                                        primary: colors.text,
                                    }
                                }}
                                label={getText('common', 'search')}
                                textColor={colors.text}
                                placeholderTextColor={colors.text}
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
            <ThemedText
                type='link'
                style={{ alignSelf: 'center' }}
                onPress={() => setAddNew(prev => !prev)}>
                {addNew ? txtChoose : txtAdd}
            </ThemedText>
        </View>
    );
}