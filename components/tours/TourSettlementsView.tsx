import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { MainFormButton } from '@/components/buttons/MainFormButton';
import ConfirmModal from '@/components/ConfirmModal';
import { Card, Row } from '@/components/tours/DetailCard';
import { TourList } from '@/components/tours/TourList';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { TourInterface, TourMInterface, ToursInterface } from '@/types';
import { formatShortDate } from '@/utils/formats/formatShortDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatBigTime } from '@/utils/formats/formatBigTime';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';

export const TourSettlementsView: React.FC = () => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const [year, setYear] = useState<number>(new Date().getUTCFullYear());
    const [data, setData] = useState<TourMInterface[] | null>(null);
    const [selected, setSelected] = useState<TourMInterface | null>(null);
    const [settledRoutes, setSettledRoutes] = useState<TourInterface[] | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<TourMInterface | null>(null);

    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    const monthLabel = (m: string) => formatShortDate(m).slice(3);

    const load = useCallback(() => {
        fetchData<TourMInterface[]>(`${API_ENDPOINTS.getRouteSettlements}/${year}`, { setData });
    }, [fetchData, year]);

    useFocusEffect(
        useCallback(() => {
            load();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [year])
    );

    useEffect(() => {
        if (selected) {
            setSettledRoutes(null);
            fetchData<TourInterface[]>(`${API_ENDPOINTS.getRoutes}/${selected.id}`, { setData: setSettledRoutes });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected?.id]);

    const executeDelete = (): void => {
        const s = confirmDelete;
        setConfirmDelete(null);
        if (!s) return;
        fetchData(API_ENDPOINTS.deleteMonthlySettlement, { method: 'DELETE', sendData: { id: s.id } }, { showSnackbar }).then((res) => {
            if (res.success) {
                showSnackbar(t('deleteSettlementSuccess'), 'success');
                load();
            }
        });
    };

    // widok tras jednego rozliczenia
    if (selected) {
        return (
            <TourList
                data={settledRoutes}
                loading={loading}
                onRefresh={() => fetchData<TourInterface[]>(`${API_ENDPOINTS.getRoutes}/${selected.id}`, { setData: setSettledRoutes })}
                emptyText={t('noTours')}
                ListHeaderComponent={
                    <Pressable onPress={() => setSelected(null)} style={styles.back}>
                        <IconButton icon="arrow-left" size={20} iconColor={colors.text} style={styles.backIcon} />
                        <ThemedText type="defaultSemiBold">
                            {t('settledRoutesTitle')} · {monthLabel(selected.month)}
                        </ThemedText>
                    </Pressable>
                }
            />
        );
    }

    if (!data && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <>
            <FlatList
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.list}
                data={(data ?? []).slice().sort((a, b) => b.id - a.id)}
                keyExtractor={(s) => s.id.toString()}
                ListHeaderComponent={
                    <View style={styles.yearBar}>
                        <IconButton icon="chevron-left" iconColor={colors.text} onPress={() => setYear((y) => y - 1)} />
                        <ThemedText type="subtitle">{year}</ThemedText>
                        <IconButton icon="chevron-right" iconColor={colors.text} onPress={() => setYear((y) => y + 1)} />
                    </View>
                }
                ListEmptyComponent={<ThemedText style={styles.empty}>{t('noSettlements')}</ThemedText>}
                renderItem={({ item }) => {
                    const salary = Number(item.salary) > 0 ? Number(item.salary) : Number(item.expectedSalary);
                    return (
                        <Card title={`${monthLabel(item.month)} · ${item.toursId.length} ${t('tours')}`}>
                            <Row label={t('distance')} value={formatOdometer(item.distance)} />
                            <Row label={t('driveTime')} value={formatBigTime(item.driveTime)} />
                            <Row label={t('workTime')} value={formatBigTime(item.workTime)} />
                            <Row label={`${t('onDuty')} / ${t('offDuty')}`} value={`${item.daysOnDuty} / ${item.daysOffDuty}`} />
                            <Row label={`${t('burned')} (${t('real')})`} value={formatFuelQuantity(item.burnedFuelReal)} />
                            <Row label={t('refueled')} value={formatFuelQuantity(item.totalRefuel, 'twoDecimals')} />
                            <Row label={`${t('salary')} (${t('real')})`} value={formatAmount(salary, item.currency)} />
                            <Row label={t('outgoings')} value={formatAmount(Number(item.outgoings), item.currency)} />
                            <Row label={t('averageLoadWeight')} value={`${formatWeight(item.avgWeight)} (${item.numberOfLoads})`} />
                            <View style={styles.actions}>
                                <MainFormButton onPress={() => setSelected(item)} text={t('viewRouteList')} />
                                <MainFormButton onPress={() => setConfirmDelete(item)} text={t('deleteSettlement')} />
                            </View>
                        </Card>
                    );
                }}
            />
            <ConfirmModal
                visible={!!confirmDelete}
                text={t('deleteSettlementConfirm')}
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete(null)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    yearBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 },
    actions: { gap: 8, marginTop: 8 },
    back: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    backIcon: { margin: 0 },
});
