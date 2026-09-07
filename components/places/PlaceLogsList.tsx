import React, { useCallback, useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { Icon, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Card, Row } from '@/components/tours/DetailCard';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { STYLES } from '@/constants/STYLES';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { LogInterface, LogListResponse, PlacesInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatCountry } from '@/utils/formats/formatCountry';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { LogEditModal } from '@/components/places/LogEditModal';

const PER_PAGE = 15;

interface RouteNr {
    tourId: number;
    tourNr: number;
}

interface Props {
    placeId: number;
}

export const PlaceLogsList: React.FC<Props> = ({ placeId }: Props): JSX.Element => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const t = (k: keyof PlacesInterface['en']) => getText('places', k, lang);

    const [items, setItems] = useState<LogInterface[] | null>(null);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editLog, setEditLog] = useState<LogInterface | null>(null);
    const [routeNrs, setRouteNrs] = useState<RouteNr[]>([]);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    const pageRef = useRef<number>(1);
    const loadingMoreRef = useRef<boolean>(false);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback(
        (reqPage: number, searchValue: string) => {
            const s = searchValue.trim().length > 1 ? `/${encodeURIComponent(searchValue.trim())}` : '';
            const url = `${API_ENDPOINTS.getLogsByPlaceId}/${placeId}/${reqPage}/${PER_PAGE}${s}`;
            pageRef.current = reqPage;

            const apply = (data: LogListResponse | null): void => {
                if (data && Array.isArray(data.items)) {
                    setItems((prev) => (reqPage === 1 || !prev ? data.items : [...prev, ...data.items]));
                    setTotalItems(Number(data.totalItems) || 0);
                } else if (reqPage === 1) {
                    setItems([]);
                    setTotalItems(0);
                }
                setLoadingMore(false);
                loadingMoreRef.current = false;
            };

            return fetchData<LogListResponse>(url, {
                setData: apply as unknown as Dispatch<SetStateAction<LogListResponse | null>>,
            });
        },
        [fetchData, placeId],
    );

    // pierwszy załadunek + reakcja na wyszukiwanie (debounce)
    useEffect(() => {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(
            () => {
                load(1, search);
            },
            search === '' ? 0 : 400,
        );
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, placeId]);

    // numery tras dla widocznych wpisów
    useEffect(() => {
        if (!items || items.length === 0) return;
        const ids = Array.from(new Set(items.map((l) => l.tourId).filter((id) => id > 0)));
        const missing = ids.filter((id) => !routeNrs.some((r) => r.tourId === id));
        if (missing.length === 0) return;
        fetchData<RouteNr[]>(API_ENDPOINTS.getRouteNumbers, { method: 'POST', sendData: { tourIds: ids } }).then((res) => {
            if (Array.isArray(res.responseData)) setRouteNrs((prev) => mergeRouteNrs(prev, res.responseData!));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const onEndReached = (): void => {
        if (loadingMoreRef.current || loading || !items) return;
        if (items.length >= totalItems) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        load(pageRef.current + 1, search);
    };

    const onRefresh = (): void => {
        load(1, search);
    };

    if (!items && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <LogEditModal key={editLog?.id ?? 'log'} log={editLog} onClose={() => setEditLog(null)} onSaved={() => load(1, search)} />

            <View style={{ paddingHorizontal: 12, paddingTop: 6 }}>
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

            <FlatList
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.list}
                data={items ?? []}
                keyExtractor={(l) => l.id.toString()}
                refreshControl={<RefreshControl refreshing={loading && !loadingMore} onRefresh={onRefresh} tintColor={colors.text} />}
                ListEmptyComponent={<ThemedText style={styles.empty}>{t('logsEmpty')}</ThemedText>}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator style={{ marginVertical: 16 }} color={colors.text} />
                    ) : items && items.length > 0 && items.length >= totalItems ? (
                        <ThemedText style={styles.end}>— {totalItems} —</ThemedText>
                    ) : null
                }
                renderItem={({ item }) => {
                    const expanded = expandedId === item.id;
                    const tourNr = routeNrs.find((r) => r.tourId === item.tourId)?.tourNr;
                    return (
                        <Pressable onPress={() => setExpandedId(expanded ? null : item.id)}>
                            <Card>
                                <View style={styles.head}>
                                    <ThemedText type="defaultSemiBold" style={{ flexShrink: 1 }}>{item.action}</ThemedText>
                                    {tourNr !== undefined && (
                                        <ThemedText style={styles.tourTag}>{t('logTour')} {tourNr}</ThemedText>
                                    )}
                                </View>
                                <ThemedText style={styles.dim}>{formatDate(item.date, lang)}</ThemedText>
                                <ThemedText style={styles.dim}>
                                    {[formatCountry(item.country, lang), formatSimplePlace(item.place, item.placeData)]
                                        .filter(Boolean)
                                        .join('  ·  ')}
                                </ThemedText>
                                <Row label={t('logOdometer')} value={formatOdometer(item.odometer)} />

                                {expanded && (
                                    <View style={styles.details}>
                                        {!!item.notes && (
                                            <ThemedText style={{ opacity: 0.9 }}>{t('logNotes')}: {item.notes}</ThemedText>
                                        )}
                                        <Pressable onPress={() => setEditLog(item)} style={styles.editRow}>
                                            <Icon source="pencil" size={20} color={colors.actionIcon} />
                                            <ThemedText>{t('logEdit')}</ThemedText>
                                        </Pressable>
                                    </View>
                                )}
                            </Card>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
};

const mergeRouteNrs = (prev: RouteNr[], next: RouteNr[]): RouteNr[] => {
    const map = new Map<number, number>();
    [...prev, ...next].forEach((r) => map.set(r.tourId, r.tourNr));
    return Array.from(map, ([tourId, tourNr]) => ({ tourId, tourNr }));
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    end: { textAlign: 'center', marginVertical: 16, opacity: 0.6 },
    head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    tourTag: { fontSize: 12, opacity: 0.7 },
    dim: { opacity: 0.8, fontSize: 13 },
    details: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.4)',
        gap: 8,
    },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
});
