import { STYLES } from "@/constants/STYLES";
import { useTheme } from "@/hooks/useTheme";
import { getText } from "@/utils/getText";
import { useEffect, useState } from "react";
import { Dimensions, FlatList, Modal, TouchableOpacity, View, Text, KeyboardAvoidingView } from "react-native";
import { HelperText, IconButton, TextInput } from "react-native-paper";
import { ThemedText } from "../../ThemedText";
import { PlaceInterface, placeTypeEnum } from "@/types";
import { useGlobalState } from "@/hooks/useGlobalState";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { CountrySelect } from "../address/CountrySelect";

interface Props {
    place: string;
    onChange: (e: string) => void;
    placeId: string;
    onChangeId: (e: string) => void;
    country: string;
    onChangeCountry: (e: string) => void;
    options?: {
        withoutPlaceId?: boolean;
    }
}

export const PlaceInput: React.FC<Props> = (props: Props): JSX.Element => {

    const { places, setPlaces, lang } = useGlobalState();
    const { fetchData } = useApi();
    const [displayedText, setDisplayedText] = useState<string>('');
    const [filteredPlaces, setFilteredPlaces] = useState<PlaceInterface[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [clearVisible, setClearVisible] = useState<boolean>(false);
    const [choosed, setChoosed] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [selectVisible, setSelectVisible] = useState<boolean>(false);
    const { colors } = useTheme();
    const screenHeight = Dimensions.get('window').height;
    const [error, setError] = useState<boolean>(false);

    const writePlace = (text: string): void => {
        props.onChangeId('0');
        props.onChange(text);
        setDisplayedText(text);
    }

    const handlePlaceSelect = (place: PlaceInterface): void => {
        props.onChange('');
        props.onChangeId(place.id.toString());
        setDisplayedText(`${place.name} - ${place.street}, ${place.code} ${place.city}`);
        setModalVisible(false);
    }

    const handleSelectButton = (): void => {
        setSearchText(props.place);
        setModalVisible(true);
        handleSearch(props.place);
    }

    const handleSearch = (search: string): void => {
        setSearchText(search);
        setDisplayedText(search);
        props.onChange(search);
        const sanitizedSearch = search.toLowerCase();
        const filteredList = places?.filter((place) => (
            place.country === props.country &&
            (place.city.toLowerCase().includes(sanitizedSearch) ||
                place.code.toLowerCase().includes(sanitizedSearch) ||
                place.name.toLowerCase().includes(sanitizedSearch) ||
                place.street.toLowerCase().includes(sanitizedSearch))
        )
        );
        if (search.length < 1 && places) {
            setFilteredPlaces(places.filter((place) => place.country === props.country));
        } else {
            setFilteredPlaces(filteredList ? filteredList : []);
        }
    }

    useEffect(() => {
        if (!places || (places && places.length === 0)) {
            fetchData<PlaceInterface[]>(API_ENDPOINTS.GET_PLACES, { setData: setPlaces }).then(() => setSelectVisible(true));
        } else {
            setSelectVisible(true);
        }
        if (props.options?.withoutPlaceId) {
            setSelectVisible(false);
        }
    }, []);

    useEffect(() => {
        if (props.place === '' && props.placeId !== '0') {
            const place = places?.find(place => place.id === Number(props.placeId));
            if (place) {
                setDisplayedText(`${place.name} - ${place.street}, ${place.code} ${place.city}`);
            }
        } else {
            setDisplayedText(props.place);
        }
    }, [places]);

    useEffect(() => {
        if (props.place.length > 0 || (props.placeId !== '0' && props.placeId !== '')) {
            setClearVisible(true);
        } else {
            setClearVisible(false);
        }
        if (props.placeId === '') props.onChangeId('0');
        if (Number(props.placeId) > 0) {
            setChoosed(true);
            props.onChange('');
        } else {
            setChoosed(false);
        }
    }, [props.place, props.placeId]);

    useEffect(() => {
        props.place.length > 30 ? setError(true) : setError(false);
    }, [props.place]);

    return (
        <View>
            <CountrySelect value={props.country} onChange={(e) => props.onChangeCountry(e)} />
            <View style={STYLES.inputWrapper}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{
                        colors: {
                            primary: colors.text,
                        }
                    }}
                    label={getText('common', 'place')}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={displayedText}
                    onChangeText={(e) => writePlace(e)}
                    error={error}
                />
                {error &&
                    <HelperText type="error" visible={error}>
                        {getText('common', 'placeHelper', lang)}
                    </HelperText>
                }
                <View style={STYLES.iconInputWrapper}>
                    {choosed &&
                        <IconButton
                            icon="check-bold"
                            size={24}
                            iconColor='darkgreen'
                        />
                    }
                    {clearVisible &&
                        <IconButton
                            icon="close"
                            size={24}
                            iconColor={colors.deleteIcon}
                            onPress={() => writePlace('')}
                        />
                    }
                    {selectVisible &&
                        <IconButton
                            icon="playlist-edit"
                            size={24}
                            iconColor={colors.text}
                            onPress={handleSelectButton}
                        />
                    }
                </View>
            </View>
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
                                {getText('common', 'choosePlace')}
                            </ThemedText>
                        </View>
                        <FlatList
                            data={filteredPlaces.sort((a, b) => {
                                if (a.isFavorite !== b.isFavorite) {
                                    return a.isFavorite ? -1 : 1;
                                }
                                if (!a.isFavorite && !b.isFavorite) {
                                    if (a.type < b.type) return -1;
                                    if (a.type > b.type) return 1;
                                }
                                if (a.code < b.code) return -1;
                                if (a.code > b.code) return 1;
                                if (a.name < b.name) return -1;
                                if (a.name > b.name) return 1;
                                return 0;
                            })}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item, index }) => {
                                const previousItem = index > 0 ? filteredPlaces[index - 1] : null;
                                return (
                                    <View>
                                        {index === 0 &&
                                            <ThemedText style={{ alignSelf: 'center', }} type='defaultSemiBold'>
                                                {getText('common', 'favorite', lang)}
                                            </ThemedText>
                                        }
                                        {item.type !== previousItem?.type && !item.isFavorite &&
                                            <ThemedText style={{ alignSelf: 'center', }} type='defaultSemiBold'>
                                                {item.type === placeTypeEnum.base && getText('common', 'placeType1', lang)}
                                                {item.type === placeTypeEnum.customs && getText('common', 'placeType7', lang)}
                                                {item.type === placeTypeEnum.loadAndunloadPlace && getText('common', 'placeType4', lang)}
                                                {item.type === placeTypeEnum.loadingPlace && getText('common', 'placeType2', lang)}
                                                {item.type === placeTypeEnum.other && getText('common', 'placeType0', lang)}
                                                {item.type === placeTypeEnum.service && getText('common', 'placeType6', lang)}
                                                {item.type === placeTypeEnum.unloadingPlace && getText('common', 'placeType3', lang)}
                                                {item.type === placeTypeEnum.parking && getText('common', 'placeType5', lang)}
                                                {item.type === placeTypeEnum.service && getText('common', 'placeType6', lang)}

                                            </ThemedText>
                                        }
                                        <TouchableOpacity onPress={() => handlePlaceSelect(item)}>
                                            <Text style={[STYLES.selectItem, { color: colors.text }]}>
                                                {item.name} - {item.street}, {item.code} {item.city}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
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
        </View>
    );
}