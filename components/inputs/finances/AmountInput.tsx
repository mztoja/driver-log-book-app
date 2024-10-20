import { ThemedText } from '@/components/ThemedText';
import { CURRENCIES, Currency } from '@/constants/CURRIENCIES';
import { STYLES } from '@/constants/STYLES';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { extractNumberWithDecimal } from '@/utils/extractNumberWithDecimal';
import { getText } from '@/utils/getText';
import { useEffect, useState } from 'react';
import { FlatList, Modal, TouchableOpacity, View, Text, KeyboardAvoidingView, Dimensions } from 'react-native';
import { TextInput } from 'react-native-paper';

interface Props {
    valueAmount: string;
    valueCurrency: string;
    onChangeAmount: (e: string) => void;
    onChangeCurrency: (e: string) => void;
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
    const { user } = useGlobalState();
    const screenHeight = Dimensions.get('window').height;

    const onModalOpen = (): void => {
        setSearchText('');
        props.onChangeCurrency('');
        setModalVisible(true);
    }

    const onChangeAmount = (v: string): void => {
        const newValue = extractNumberWithDecimal(v);
        props.onChangeAmount(newValue);
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
        if (!props.valueCurrency) {
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
                label={props.options?.amountLabel || getText('common', 'amount')}
                value={props.valueAmount}
                onChangeText={onChangeAmount}
                textColor={colors.text}
                placeholderTextColor={colors.text}
                keyboardType='numeric'
            />
            <TouchableOpacity onPress={() => { onModalOpen() }}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground, maxWidth: 150 }]}
                    theme={{
                        colors: {
                            primary: colors.text,
                        }
                    }}
                    label={getText('common', 'currency')}
                    value={searchText}
                    textColor={colors.text}
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
                            data={filteredCurrencies}
                            keyExtractor={(item) => item.code}
                            renderItem={({ item }) => (
                                <TouchableOpacity onPress={() => handleCurrencySelect(item)}>
                                    <Text style={[STYLES.selectItem, { color: colors.text }]}>{item.code} - {item.symbol}</Text>
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
        </View >
    );
};