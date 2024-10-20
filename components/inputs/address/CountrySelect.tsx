import { STYLES } from '@/constants/STYLES';
import { COUNTRIES, Country } from '@/constants/COUNTRIES';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { CountryCodesEntries } from '@/types';
import { getText } from '@/utils/getText';
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity, Modal, KeyboardAvoidingView, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const CountrySelect: React.FC<Props> = (props: Props): JSX.Element => {
    const [filteredCountries, setFilteredCountries] = useState<Country[]>(COUNTRIES);
    const [searchText, setSearchText] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { colors } = useTheme();
    const lang = useGlobalState().lang;
    const screenHeight = Dimensions.get('window').height;

    const onModalOpen = (): void => {
        setModalVisible(true);
        handleSearch('');
        props.onChange('');
    }

    useEffect(() => {
        if (props.value) {
            const country = COUNTRIES.find(country => country.code === props.value);
            if (country) {
                setSearchText(getCountryName(country.code) + ' (' + country.code + ')' + ' +' + country.phone);
            } else {
                onModalOpen();
            }
        }
    }, [props.value]);

    const getCountryName = (code: keyof CountryCodesEntries): string => {
        return getText('countries', code, lang);
    }

    const handleSearch = (search: string): void => {
        setSearchText(search);
        const sanitizedSearch = search.replace(/\+/g, '').toLowerCase();
        const filteredList = COUNTRIES.filter(country => {
            const countryName = getCountryName(country.code).toLowerCase();
            const countryCode = country.code.toLowerCase();
            const countryPhone = country.phone.toLowerCase();

            return (
                countryName.includes(sanitizedSearch) ||
                countryCode.includes(sanitizedSearch) ||
                countryPhone.includes(sanitizedSearch)
            );
        });
        if (search.length < 1) {
            setFilteredCountries(COUNTRIES);
        } else {
            setFilteredCountries(filteredList);
        }
    };

    const handleCountrySelect = (country: Country): void => {
        setSearchText(getCountryName(country.code) + ' (' + country.code + ')' + ' +' + country.phone);
        props.onChange(country.code);
        setModalVisible(false);
    };

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
                    label={getText('common', 'country') + '*'}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={searchText}
                    editable={false}
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
                                {getText('common', 'chooseFromList')}
                            </ThemedText>
                        </View>
                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleCountrySelect(item)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{getCountryName(item.code)} ({item.code}) +{item.phone}</Text>
                                </TouchableOpacity>
                            )}
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