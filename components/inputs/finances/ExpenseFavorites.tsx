import React from 'react';
import { Dimensions, FlatList, Modal, TouchableOpacity, View, Text, ActivityIndicator } from 'react-native';
import { IconButton } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { STYLES } from '@/constants/STYLES';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import { DeleteExpenseFavoriteData, ExpenseFavoriteInterface } from '@/types';

interface Props {
    visible: boolean;
    onClose: () => void;
    onApply: (fav: ExpenseFavoriteInterface) => void;
}

export const ExpenseFavorites: React.FC<Props> = ({ visible, onClose, onApply }: Props): JSX.Element => {
    const { colors } = useTheme();
    const { lang, places } = useGlobalState();
    const { fetchData, loading } = useApi();
    const screenHeight = Dimensions.get('window').height;
    const [list, setList] = React.useState<ExpenseFavoriteInterface[]>([]);

    const setListSafe = React.useCallback(
        (v: React.SetStateAction<ExpenseFavoriteInterface[] | null>) => {
            setList(Array.isArray(v) ? v : []);
        },
        [],
    );

    const txt = {
        title: getText('home', 'expenseFavTitle', lang),
        empty: getText('home', 'expenseFavEmpty', lang),
        delete: getText('home', 'expenseFavDelete', lang),
        cash: getText('home', 'cash', lang),
    };

    React.useEffect(() => {
        if (!visible) return;
        fetchData<ExpenseFavoriteInterface[]>(API_ENDPOINTS.getExpenseFavorites, {
            setData: setListSafe,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    const choose = (fav: ExpenseFavoriteInterface): void => {
        onApply(fav);
        onClose();
    };

    const erase = (id: number): void => {
        const sendData: DeleteExpenseFavoriteData = { favoriteId: id.toString() };
        fetchData<ExpenseFavoriteInterface[]>(API_ENDPOINTS.deleteExpenseFavorite, {
            method: 'DELETE',
            sendData,
        }).then((res) => {
            if (Array.isArray(res.responseData)) setList(res.responseData);
        });
    };

    const label = (fav: ExpenseFavoriteInterface): string => {
        const placeLabel = fav.place || places?.find((p) => p.id === fav.placeId)?.name || '';
        return [placeLabel, fav.itemDescription, Number(fav.unitPrice).toFixed(2), fav.payment || txt.cash]
            .filter(Boolean)
            .join('  ·  ');
    };

    return (
        <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
            <View style={STYLES.modalSelectContainer}>
                <TouchableOpacity style={STYLES.modalSelectBlackout} onPress={onClose} />
                <View style={[STYLES.modaSelectContent, { backgroundColor: colors.background, height: screenHeight * 0.5 }]}>
                    <View style={{ marginBottom: 10 }}>
                        <ThemedText style={{ alignSelf: 'center' }} type="subtitle">
                            {txt.title}
                        </ThemedText>
                    </View>
                    {loading && list.length === 0 ? (
                        <ActivityIndicator color={colors.text} style={{ marginTop: 20 }} />
                    ) : list.length === 0 ? (
                        <ThemedText style={{ alignSelf: 'center', opacity: 0.7, marginTop: 20 }}>{txt.empty}</ThemedText>
                    ) : (
                        <FlatList
                            data={list}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <View style={STYLES.inputWrapper}>
                                    <TouchableOpacity onPress={() => choose(item)} style={{ flex: 1 }}>
                                        <Text style={[STYLES.selectItem, { color: colors.text }]}>{label(item)}</Text>
                                    </TouchableOpacity>
                                    <View style={STYLES.iconInputWrapper}>
                                        <IconButton
                                            icon="close-circle-outline"
                                            size={24}
                                            iconColor={colors.deleteIcon}
                                            onPress={() => erase(item.id)}
                                            accessibilityLabel={txt.delete}
                                        />
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>
            </View>
        </Modal>
    );
};
