import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, router, type Href } from 'expo-router';
import { Icon, IconButton } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { SegmentedTabs } from '@/components/tours/SegmentedTabs';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { VehicleInterface, vehicleTypeEnum, VehiclesInterface } from '@/types';
import { formatShortDate } from '@/utils/formats/formatShortDate';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';
import { CompanySelect } from '@/components/vehicles/CompanySelect';
import { VehicleFormModal } from '@/components/vehicles/VehicleFormModal';

type Tab = 'trucks' | 'trailers';

interface Props {
    // głęboki link (np. „Pokaż szczegóły pojazdu" z panelu Info) – rozwija i przewija do pojazdu
    focusId?: number;
}

// daty z bazy porównujemy tekstowo (YYYY-MM-DD) – bez obiektów Date i stref
const todayStr = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
};
const isPast = (date: string | null): boolean => !!date && /^\d{4}-\d{2}-\d{2}/.test(date) && date.slice(0, 10) < todayStr();

/** Odpowiednik front `VehiclesView` + `TrucksList` + `TrailersList`. */
export const VehiclesList: React.FC<Props> = ({ focusId }): JSX.Element => {
    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const { lang, user, activeTour, lastLog } = useGlobalState();
    const t = (k: keyof VehiclesInterface['en']) => getText('vehicles', k, lang);

    const [tab, setTab] = useState<Tab>('trucks');
    const [companyId, setCompanyId] = useState<number>(user?.companyId ?? 0);
    const [trucks, setTrucks] = useState<VehicleInterface[] | null>(null);
    const [trailers, setTrailers] = useState<VehicleInterface[] | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(focusId ?? null);
    const [addVisible, setAddVisible] = useState<boolean>(false);
    const [editVehicle, setEditVehicle] = useState<VehicleInterface | null>(null);
    const listRef = useRef<FlatList<VehicleInterface>>(null);
    const focusHandled = useRef<number | null>(null);

    const load = useCallback(() => {
        fetchData<VehicleInterface[]>(API_ENDPOINTS.getTrucksList).then((res) => {
            if (Array.isArray(res.responseData)) setTrucks(res.responseData);
            else showSnackbar(t('apiTrucksError'), 'error');
        });
        fetchData<VehicleInterface[]>(API_ENDPOINTS.getTrailersList).then((res) => {
            if (Array.isArray(res.responseData)) setTrailers(res.responseData);
            else showSnackbar(t('apiTrailersError'), 'error');
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lang]);

    useFocusEffect(useCallback(() => load(), [load]));

    // firma użytkownika może dojechać po pierwszym renderze
    useEffect(() => {
        if (!companyId && user?.companyId) setCompanyId(user.companyId);
    }, [user?.companyId, companyId]);

    const shown = useMemo<VehicleInterface[]>(() => {
        const source = tab === 'trucks' ? trucks : trailers;
        const type = tab === 'trucks' ? vehicleTypeEnum.truck : vehicleTypeEnum.trailer;
        return (source ?? []).filter((v) => v.type === type && v.companyId === companyId);
    }, [tab, trucks, trailers, companyId]);

    // głęboki link: właściwa zakładka + firma pojazdu, rozwinięcie i przewinięcie
    useEffect(() => {
        if (!focusId || focusHandled.current === focusId || !trucks || !trailers) return;
        const vehicle = [...trucks, ...trailers].find((v) => v.id === focusId);
        if (!vehicle) return;
        setTab(vehicle.type === vehicleTypeEnum.truck ? 'trucks' : 'trailers');
        setCompanyId(vehicle.companyId);
        setExpandedId(vehicle.id);
        focusHandled.current = focusId;
    }, [focusId, trucks, trailers]);

    useEffect(() => {
        if (!focusId || focusHandled.current !== focusId) return;
        const index = shown.findIndex((v) => v.id === focusId);
        if (index >= 0) {
            requestAnimationFrame(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 }));
        }
    }, [shown, focusId]);

    const isCurrent = (v: VehicleInterface): boolean =>
        !!activeTour && (v.registrationNr === activeTour.truck || v.registrationNr === activeTour.trailer);

    if ((!trucks || !trailers) && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <VehicleFormModal
                key={addVisible ? 'add-open' : 'add'}
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                onSaved={load}
                initialType={tab === 'trucks' ? vehicleTypeEnum.truck : vehicleTypeEnum.trailer}
            />
            {editVehicle && (
                <VehicleFormModal
                    key={editVehicle.id}
                    visible
                    vehicle={editVehicle}
                    onClose={() => setEditVehicle(null)}
                    onSaved={load}
                />
            )}

            <SegmentedTabs<Tab>
                value={tab}
                onChange={setTab}
                tabs={[
                    { key: 'trucks', label: t('trucksTab') },
                    { key: 'trailers', label: t('trailersTab') },
                ]}
            />
            <View style={styles.filters}>
                <CompanySelect value={companyId} onChange={setCompanyId} />
            </View>

            <FlatList
                ref={listRef}
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.list}
                data={shown}
                keyExtractor={(v) => v.id.toString()}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.text} />}
                ListEmptyComponent={<ThemedText style={styles.empty}>{t('empty')}</ThemedText>}
                onScrollToIndexFailed={({ index }) =>
                    setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 }), 300)
                }
                renderItem={({ item, index }) => {
                    const expanded = expandedId === item.id;
                    const truck = item.type === vehicleTypeEnum.truck;
                    const anyExpired = isPast(item.techRev) || isPast(item.insurance) || (truck && isPast(item.tacho));
                    return (
                        <Pressable
                            onPress={() => setExpandedId(expanded ? null : item.id)}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor: isCurrent(item) ? colors.actionIcon : colors.headerBackground,
                                },
                            ]}
                        >
                            <View style={styles.cardHead}>
                                <ThemedText type="defaultSemiBold" style={{ flexShrink: 1 }}>
                                    {index + 1}. {item.registrationNr}
                                    {item.model ? `  ·  ${item.model}` : ''}
                                </ThemedText>
                                <View style={styles.cardHeadIcons}>
                                    {!!item.notes && <Icon source="text-box-outline" size={16} color={colors.text} />}
                                    {anyExpired && <Icon source="alert-circle-outline" size={16} color={colors.deleteIcon} />}
                                </View>
                            </View>
                            {isCurrent(item) && <ThemedText style={styles.tag}>{t('currentVehicle')}</ThemedText>}
                            <Row label={t('techRev')} value={formatShortDate(item.techRev)} danger={isPast(item.techRev)} />
                            <Row label={t('insurance')} value={formatShortDate(item.insurance)} danger={isPast(item.insurance)} />

                            {expanded && (
                                <View style={styles.details}>
                                    <Row label={t('yearOfProduction')} value={item.year === 0 ? '---' : String(item.year)} />
                                    <Row label={t('weightDisp')} value={formatWeight(item.weight)} />
                                    {truck && (
                                        <>
                                            <Row label={t('isLoadable')} value={item.isLoadable ? t('yes') : t('no')} />
                                            <Row label={t('tankCapacity')} value={formatFuelQuantity(item.fuel ?? 0)} />
                                            <Row label={t('tacho')} value={formatShortDate(item.tacho ?? '')} danger={isPast(item.tacho)} />
                                            <Row
                                                label={t('nextService')}
                                                value={formatOdometer(item.service ?? 0)}
                                                danger={!!lastLog && isCurrent(item) && !!item.service && item.service <= lastLog.odometer}
                                            />
                                        </>
                                    )}
                                    {!!item.notes && <ThemedText style={styles.notes}>{item.notes}</ThemedText>}
                                    <View style={styles.actions}>
                                        <ActionRow
                                            icon="wrench"
                                            label={t('showServices')}
                                            onPress={() => router.push(`/vehicles/${item.id}/services` as Href)}
                                        />
                                        <ActionRow icon="pencil" label={t('edit')} onPress={() => setEditVehicle(item)} />
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    );
                }}
            />

            <IconButton
                icon="plus"
                size={28}
                mode="contained"
                containerColor={colors.buttonColor}
                iconColor={colors.buttonTextColor}
                style={styles.fab}
                onPress={() => setAddVisible(true)}
            />
        </View>
    );
};

const ActionRow: React.FC<{ icon: string; label: string; onPress: () => void }> = ({ icon, label, onPress }) => {
    const { colors } = useTheme();
    return (
        <Pressable onPress={onPress} style={styles.actionRow}>
            <Icon source={icon} size={20} color={colors.actionIcon} />
            <ThemedText>{label}</ThemedText>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    filters: { paddingHorizontal: 12, paddingTop: 6 },
    list: { padding: 12, gap: 10, flexGrow: 1, paddingBottom: 90 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    card: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 3 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    cardHeadIcons: { flexDirection: 'row', gap: 4 },
    tag: { fontSize: 12, opacity: 0.7 },
    details: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.4)',
        gap: 3,
    },
    notes: { marginTop: 6, opacity: 0.9 },
    actions: { marginTop: 4, gap: 2 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    fab: { position: 'absolute', right: 16, bottom: 24, borderRadius: 30 },
});
