import React, { JSX, useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Stack, useFocusEffect } from 'expo-router';
import { Icon, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { SegmentedTabs } from '@/components/tours/SegmentedTabs';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { STYLES } from '@/constants/STYLES';
import { ServiceInterface, serviceTypeEnum, VehicleInterface, vehicleTypeEnum, VehiclesInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatShortDate } from '@/utils/formats/formatShortDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { formatCountry } from '@/utils/formats/formatCountry';
import { ServiceEditModal } from '@/components/vehicles/ServiceEditModal';

type Filter = 'all' | 'maintenance' | 'service';

/** Odpowiednik front `ServiceList`: serwisy pojazdu, filtr rodzaju, wyszukiwanie, rozwijanie i edycja. */
export const ServicesList: React.FC<{ vehicleId: number }> = ({ vehicleId }): JSX.Element => {
    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const { lang } = useGlobalState();
    const t = (k: keyof VehiclesInterface['en']) => getText('vehicles', k, lang);

    const [data, setData] = useState<ServiceInterface[] | null>(null);
    const [vehicle, setVehicle] = useState<VehicleInterface | null>(null);
    const [vehicleReg, setVehicleReg] = useState<string>('. . .');
    const [filter, setFilter] = useState<Filter>('all');
    const [search, setSearch] = useState<string>('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editService, setEditService] = useState<ServiceInterface | null>(null);

    const load = useCallback(() => {
        fetchData<ServiceInterface[]>(`${API_ENDPOINTS.getServiceByVehicleId}/${vehicleId}`).then((res) => {
            setData(Array.isArray(res.responseData) ? res.responseData : []);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vehicleId]);

    useFocusEffect(useCallback(() => {
        load();
        // nr rejestracyjny do nagłówka + typ pojazdu (czy edycja ma pole licznika)
        fetchData<{ data: string }>(`${API_ENDPOINTS.getVehicleRegById}/${vehicleId}`).then((res) => {
            if (!res.responseData) return;
            const reg = res.responseData.data;
            setVehicleReg(reg);
            fetchData<VehicleInterface>(`${API_ENDPOINTS.GET_VEHICLE_BY_REG}/${reg}`, { setData: setVehicle });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [vehicleId]));

    const shown = useMemo<ServiceInterface[]>(() => {
        let list = data ?? [];
        if (filter === 'service') list = list.filter((s) => s.type === serviceTypeEnum.service);
        if (filter === 'maintenance') list = list.filter((s) => s.type === serviceTypeEnum.maintenance);
        // jak front: wyszukiwanie od 2 znaków, po opisie, czynności i dacie
        if (search.trim().length >= 2) {
            const q = search.trim().toLowerCase();
            list = list.filter((s) =>
                s.entry?.toLowerCase().includes(q) ||
                s.logData?.action?.toLowerCase().includes(q) ||
                String(s.logData?.date ?? '').toLowerCase().includes(q),
            );
        }
        return list;
    }, [data, filter, search]);

    const typeLabel = (s: ServiceInterface): string =>
        s.type === serviceTypeEnum.service ? t('serviceService') : t('serviceMaintenance');

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <Stack.Screen options={{ title: getText('vehicles', 'serviceHeader', lang, vehicleReg) }} />
            {editService && (
                <ServiceEditModal
                    key={editService.id}
                    service={editService}
                    isTruck={vehicle?.type === vehicleTypeEnum.truck}
                    onClose={() => setEditService(null)}
                    onSaved={load}
                />
            )}

            <SegmentedTabs<Filter>
                value={filter}
                onChange={setFilter}
                tabs={[
                    { key: 'all', label: t('serviceAll') },
                    { key: 'maintenance', label: t('serviceMaintenance') },
                    { key: 'service', label: t('serviceService') },
                ]}
            />
            <View style={styles.searchBox}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{ colors: { primary: colors.text } }}
                    label={t('search')}
                    value={search}
                    onChangeText={setSearch}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    right={search ? <TextInput.Icon icon="close" onPress={() => setSearch('')} /> : undefined}
                />
            </View>

            {!data && loading
                ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.text} />
                : <FlatList
                    style={{ backgroundColor: colors.background }}
                    contentContainerStyle={styles.list}
                    data={shown}
                    keyExtractor={(s) => s.id.toString()}
                    keyboardShouldPersistTaps="handled"
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.text} />}
                    ListEmptyComponent={<ThemedText style={styles.empty}>{t('serviceEmpty')}</ThemedText>}
                    renderItem={({ item, index }) => {
                        const expanded = expandedId === item.id;
                        const log = item.logData;
                        return (
                            <Pressable
                                onPress={() => setExpandedId(expanded ? null : item.id)}
                                style={[styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.headerBackground }]}
                            >
                                <View style={styles.cardHead}>
                                    <ThemedText type="defaultSemiBold" style={{ flexShrink: 1 }}>
                                        {index + 1}. {item.entry}
                                    </ThemedText>
                                    {!!log?.notes && <Icon source="text-box-outline" size={16} color={colors.text} />}
                                </View>
                                <ThemedText style={styles.dim}>
                                    {typeLabel(item)}
                                    {log ? `  ·  ${expanded ? formatDate(log.date, lang) : formatShortDate(log.date)}` : ''}
                                </ThemedText>
                                {!!log && !expanded &&
                                    <ThemedText style={styles.dim}>{formatSimplePlace(log.place, log.placeData)}</ThemedText>
                                }
                                {!!log && <Row label={t('serviceOdometer')} value={formatOdometer(log.odometer, true)} />}

                                {expanded && (
                                    <View style={styles.details}>
                                        {!!log && (log.placeData
                                            ? <View>
                                                <ThemedText>{log.placeData.name}</ThemedText>
                                                <ThemedText>{log.placeData.street}</ThemedText>
                                                <ThemedText>{log.placeData.code} - {log.placeData.city}</ThemedText>
                                                <ThemedText>{formatCountry(log.placeData.country, lang)}</ThemedText>
                                            </View>
                                            : <ThemedText>{[formatCountry(log.country, lang), log.place].filter(Boolean).join('  ·  ')}</ThemedText>
                                        )}
                                        {!!log?.notes && <ThemedText style={styles.notes}>{log.notes}</ThemedText>}
                                        <Pressable onPress={() => setEditService(item)} style={styles.actionRow}>
                                            <Icon source="pencil" size={20} color={colors.actionIcon} />
                                            <ThemedText>{t('edit')}</ThemedText>
                                        </Pressable>
                                    </View>
                                )}
                            </Pressable>
                        );
                    }}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    searchBox: { paddingHorizontal: 12, paddingTop: 6 },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    card: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 3 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    dim: { opacity: 0.8, fontSize: 13 },
    details: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.4)',
        gap: 4,
    },
    notes: { marginTop: 4, opacity: 0.9 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
});
