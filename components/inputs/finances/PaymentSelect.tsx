import { ThemedText } from '@/components/ThemedText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { STYLES } from '@/constants/STYLES';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { AddPaymentData, DeletePaymentData, PaymentInterface } from '@/types';
import { getText } from '@/utils/getText';
import React from 'react';
import { Dimensions, FlatList, Modal, TouchableOpacity, View, Text, KeyboardAvoidingView } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';

interface Props {
    value: string;
    onChange: (e: string) => void;
    editMode?: boolean;
}

export const PaymentSelect: React.FC<Props> = (props: Props): JSX.Element => {

    const [modalVisible, setModalVisible] = React.useState<boolean>(false);
    const [addText, setAddText] = React.useState<string>('');
    const [refresh, setRefresh] = React.useState<boolean>(false);
    const { colors } = useTheme();
    const { paymentMethods, setPaymentMethods } = useGlobalState();
    const { fetchData, loading } = useApi();
    const screenHeight = Dimensions.get('window').height;
    const txt = {
        chooseFromList: getText('common', 'chooseFromList'),
        cash: getText('home', 'cash'),
        paymentMethod: getText('home', 'paymentMethod'),
        addLabel: getText('home', 'newPaymentLabel'),
    };

    const onModalOpen = (): void => {
        setModalVisible(true);
    };

    const handlePaymentSelect = (payment: string): void => {
        props.onChange(payment);
        setModalVisible(false);
    };

    const setAsDefault = (id: number): void => {
        const sendData: DeletePaymentData = {
            paymentId: id.toString(),
        }
        fetchData(API_ENDPOINTS.SELECT_PAYMENT_METHOD, { method: 'PATCH', sendData }).then(() => {
            setRefresh((prev) => !prev);
        });
    };

    const handleDelete = (id: number): void => {
        const sendData: DeletePaymentData = {
            paymentId: id.toString(),
        }
        fetchData(API_ENDPOINTS.DELETE_PAYMENT_METHOD, { method: 'DELETE', sendData }).then(() => {
            setRefresh((prev) => !prev);
        });
    };

    const handleAdd = (): void => {
        const sendData: AddPaymentData = {
            paymentMethod: addText,
        }
        if (paymentMethods?.some(p => p.method === addText)) {
            setAddText('');
        } else {
            fetchData(API_ENDPOINTS.ADD_PAYMENT_METHOD, { method: 'POST', sendData }).then(() => {
                setAddText('');
                setRefresh((prev) => !prev);
            });
        }
    }

    React.useEffect(() => {
        fetchData<PaymentInterface[]>(API_ENDPOINTS.GET_PAYMENTS_METHOD, { setData: setPaymentMethods });
    }, [refresh]);

    React.useEffect(() => {
        if (paymentMethods) {
            const defaultMethod = paymentMethods.find((payment) =>
                props.editMode
                    ? payment.method === props.value
                    : payment.default === true
            );
            props.onChange(defaultMethod ? defaultMethod.method : txt.cash);
        } else {
            if (props.value === '') { props.onChange(txt.cash) }
        }
    }, [paymentMethods]);

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
                    label={txt.paymentMethod}
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
                        <View style={STYLES.inputWrapper}>
                            <TouchableOpacity onPress={() => handlePaymentSelect(txt.cash)}>
                                <Text style={[STYLES.selectItem, { color: colors.text }]}>{txt.cash}</Text>
                            </TouchableOpacity>
                            <View style={STYLES.iconInputWrapper}>
                                {paymentMethods && paymentMethods.some(p => p.default === true) ?
                                    <IconButton
                                        icon="checkbox-blank-outline"
                                        size={24}
                                        iconColor={colors.text}
                                        onPress={() => setAsDefault(0)}
                                    />
                                    :
                                    <IconButton
                                        icon="checkbox-outline"
                                        size={24}
                                        iconColor='darkgreen'
                                    />
                                }
                                <IconButton
                                    icon="close"
                                    size={24}
                                    iconColor={colors.disabledIcon}
                                />
                            </View>
                        </View>
                        <FlatList
                            data={paymentMethods}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={STYLES.inputWrapper}>
                                    <TouchableOpacity onPress={() => handlePaymentSelect(item.method)}>
                                        <Text style={[STYLES.selectItem, { color: colors.text }]}>{item.method}</Text>
                                    </TouchableOpacity>
                                    <View style={STYLES.iconInputWrapper}>
                                        {item.default === true ?
                                            <IconButton
                                                icon="checkbox-outline"
                                                size={24}
                                                iconColor='darkgreen'
                                            />
                                            :
                                            <IconButton
                                                icon="checkbox-blank-outline"
                                                size={24}
                                                iconColor={colors.text}
                                                onPress={() => setAsDefault(item.id)}
                                            />
                                        }
                                        <IconButton
                                            icon="close"
                                            size={24}
                                            iconColor={colors.deleteIcon}
                                            onPress={() => handleDelete(item.id)}
                                        />
                                    </View>
                                </View>
                            )}
                        />
                        <KeyboardAvoidingView style={{ backgroundColor: colors.inputBackground }}>
                            <View style={STYLES.inputWrapper}>
                                <TextInput
                                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                                    theme={{
                                        colors: {
                                            primary: colors.text,
                                        }
                                    }}
                                    label={txt.addLabel}
                                    textColor={colors.text}
                                    placeholderTextColor={colors.text}
                                    value={addText}
                                    onChangeText={setAddText}
                                />
                            </View>
                            <View style={STYLES.iconInputWrapper}>
                                <IconButton
                                    icon="plus-box-outline"
                                    size={24}
                                    iconColor={colors.actionIcon}
                                    onPress={handleAdd}
                                />
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}