import { ThemedText } from '@/components/ThemedText';
import { CURRENCIES, Currency } from '@/constants/CURRIENCIES';
import { STYLES } from '@/constants/STYLES';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { extractNumberWithDecimal } from '@/utils/extractNumberWithDecimal';
import { getText } from '@/utils/getText';
import React, { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { FlatList, Modal, TouchableOpacity, View, Text, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
interface Props {
    valueAmount: string;
    valueCurrency: string;
    onChangeAmount: (e: string) => void;
    onChangeCurrency: (e: string) => void;
    marker?: Dispatch<SetStateAction<boolean>>;
    options?: {
        currencyDisable?: boolean;
        amountLabel?: string;
    }
}

export const AmountInput: React.FC<Props> = (props: Props): JSX.Element => {

    const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>(CURRENCIES);
    const [searchText, setSearchText] = useState<string>('');
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const { colors } = useTheme();
    // okno wysuwane od dołu – margines nad systemowymi przyciskami (edge-to-edge)
    const bottomInset = useSafeAreaInsets().bottom;
    const { user } = useGlobalState();
    const screenHeight = Dimensions.get('window').height;
    const txt = {
        amount: getText('common', 'amount'),
        currency: getText('common', 'currency'),
        chooseFromList: getText('common', 'chooseFromList'),
        search: getText('common', 'search'),
    };

    const onModalOpen = (): void => {
        setSearchText('');
        props.onChangeCurrency('');
        setModalVisible(true);
    }

    const changeValue = (v: string): void => {
        const newValue = extractNumberWithDecimal(v);
        props.onChangeAmount(newValue);
        props.marker && props.marker(prev => !prev);
    }

    const handleSearch = (search: string): void => {
        setSearchText(search);
        const sanitizedSearch = search.toLowerCase();
        const filteredList = CURRENCIES.filter(currency => {
            const currencyCode = currency.code.toLowerCase();
            const currencySymbol = currency.symbol.toLowerCase();
            return (
                currencyCode.includes(sanitizedSearch) ||
                currencySymbol.includes(sanitizedSearch)
            );
        });
        if (search.length < 1) {
            setFilteredCurrencies(CURRENCIES);
        } else {
            setFilteredCurrencies(filteredList);
        }
    }

    const handleCurrencySelect = (currency: Currency): void => {
        setModalVisible(false);
        setSearchText(currency.symbol + ' (' + currency.code + ')');
        props.onChangeCurrency(currency.code);

    }

    useEffect(() => {
        if (props.valueCurrency) {
            const currency = CURRENCIES.find(currency => currency.code === props.valueCurrency);
            currency ? setSearchText(currency.symbol + ' (' + currency.code + ')') : onModalOpen();
        }
    }, [props.valueCurrency]);

    useEffect(() => {
        // Jak front: waluta widoczna w polu musi trafić do formularza także wtedy, gdy przyszła
        // jako wartość domyślna (np. waluta kraju przy płatności w obcej walucie) – inaczej
        // do bazy poszedłby pusty string, dopóki użytkownik nie wybierze jej ręcznie.
        if (props.valueCurrency) {
            props.onChangeCurrency(props.valueCurrency);
        } else {
            user ? props.onChangeCurrency(user.currency) : props.onChangeCurrency('EUR');
        }
    }, []);

    return (
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
            <TextInput
                style={[STYLES.textInput, { backgroundColor: colors.inputBackground, maxWidth: 150 }]}
                theme={{
                    colors: {
                        primary: colors.text,
                    }
                }}
                label={props.options?.amountLabel || txt.amount}
                value={props.valueAmount}
                onChangeText={(e) => changeValue(e)}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
            <TouchableOpacity onPress={() => { if (!props.options?.currencyDisable) onModalOpen() }}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground, maxWidth: 150 }]}
                    theme={{
                        colors: {
                            primary: colors.text,
                        }
                    }}
                    label={txt.currency}
                    value={searchText}
                    textColor={!props.options?.currencyDisable ? colors.text : colors.disabledIcon}
                    placeholderTextColor={colors.text}
                    editable={false}
                />
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <View style={STYLES.modalSelectContainer}>
                    <View style={STYLES.modalSelectBlackout} />
                    <View style={[STYLES.modaSelectContent, { paddingBottom: 10 + bottomInset, backgroundColor: colors.background, height: screenHeight * 0.5 }]}>
                        <View style={{ marginBottom: 10 }}>
                            <ThemedText
                                style={{ alignSelf: 'center' }}
                                type="subtitle"
                            >
                                {txt.chooseFromList}
                            </ThemedText>
                        </View>
                        <View style={{ marginBottom: 6 }}>
                            <TextInput
                                style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                                theme={{
                                    colors: {
                                        primary: colors.text,
                                    }
                                }}
                                label={txt.search}
                                textColor={colors.text}
                                placeholderTextColor={colors.text}
                                value={searchText}
                                onChangeText={handleSearch}
                            />
                        </View>
                        <FlatList
                            // lista mieści się w oknie i przewija w środku – bez tego rośnie do pełnej
                            // wysokości treści i wypycha resztę okna pod systemowe przyciski
                            style={{ flexShrink: 1 }}
                            data={filteredCurrencies}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleCurrencySelect(item)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{item.code} - {item.symbol}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View >
    );
};