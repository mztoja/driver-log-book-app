import React, { useCallback, useEffect, useRef, useState, Dispatch, SetStateAction } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Icon, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/tours/DetailCard';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { STYLES } from '@/constants/STYLES';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';

const PER_PAGE = 15;

export type RecordSource =
    | { kind: 'tour'; tourId: number }
    | { kind: 'place'; placeId: number }
    | { kind: 'all' };

export interface RecordEditProps<T> {
    item: T;
    onClose: () => void;
    onSaved: () => void;
}

export interface RecordConfig<T> {
    /** endpointy backendu: tryb trasy, tryb miejsca (opcjonalny), tryb „wszystkie" */
    endpoints: { tour: string; place?: string; all: string };
    /** czy tryby stronicowane pokazują wyszukiwarkę */
    searchable: boolean;
    /** wiersz zwinięty */
    renderSummary: (item: T) => React.ReactNode;
    /** dodatkowa treść po rozwinięciu wiersza */
    renderDetails?: (item: T) => React.ReactNode;
    /** modal edycji – montowany gdy użytkownik kliknie „Edytuj" */
    EditComponent?: React.ComponentType<RecordEditProps<T>>;
    emptyText: string;
}

interface Props<T> {
    source: RecordSource;
    config: RecordConfig<T>;
}

interface ListResponse<T> {
    items: T[];
    totalItems: number;
}

interface RouteNr {
    tourId: number;
    tourNr: number;
}

const mergeRouteNrs = (prev: RouteNr[], next: RouteNr[]): RouteNr[] => {
    const map = new Map<number, number>();
    [...prev, ...next].forEach((r) => map.set(r.tourId, r.tourNr));
    return Array.from(map, ([tourId, tourNr]) => ({ tourId, tourNr }));
};

const sourceKey = (s: RecordSource): string =>
    s.kind === 'tour' ? `tour-${s.tourId}` : s.kind === 'place' ? `place-${s.placeId}` : 'all';

export function RecordList<T extends { id: number; tourId: number }>({ source, config }: Props<T>): JSX.Element {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();

    const paginated = source.kind !== 'tour';
    const showSearch = paginated && config.searchable;
    const srcKey = sourceKey(source);

    const [items, setItems] = useState<T[] | null>(null);
    const [totalItems, setTotalItems] = useState<number>(0);
    const [search, setSearch] = useState<string>('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [editItem, setEditItem] = useState<T | null>(null);
    const [routeNrs, setRouteNrs] = useState<RouteNr[]>([]);
    const [loadingMore, setLoadingMore] = useState<boolean>(false);

    const pageRef = useRef<number>(1);
    const loadingMoreRef = useRef<boolean>(false);
    const searchRef = useRef<string>('');
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const didMount = useRef<boolean>(false);

    // aktualny tekst wyszukiwania dostępny w useFocusEffect (bez wymuszania rerejestracji efektu)
    useEffect(() => {
        searchRef.current = search;
    }, [search]);

    const load = useCallback(
        (reqPage: number, searchValue: string) => {
            if (source.kind === 'tour') {
                return fetchData<T[]>(`${config.endpoints.tour}/${source.tourId}`, {
                    setData: setItems as Dispatch<SetStateAction<T[] | null>>,
                });
            }

            const base =
                source.kind === 'place'
                    ? `${config.endpoints.place}/${source.placeId}`
                    : config.endpoints.all;
            const s = searchValue.trim().length > 1 ? `/${encodeURIComponent(searchValue.trim())}` : '';
            const url = `${base}/${reqPage}/${PER_PAGE}${s}`;
            pageRef.current = reqPage;

            const apply = (data: ListResponse<T> | null): void => {
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

            return fetchData<ListResponse<T>>(url, {
                setData: apply as unknown as Dispatch<SetStateAction<ListResponse<T> | null>>,
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [config.endpoints.tour, config.endpoints.place, config.endpoints.all, srcKey],
    );

    const reload = useCallback(() => {
        load(1, search);
    }, [load, search]);

    // wejście na ekran / zmiana źródła – ładujemy od początku
    useFocusEffect(
        useCallback(() => {
            setExpandedId(null);
            load(1, searchRef.current);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [srcKey]),
    );

    // reakcja na wyszukiwanie (debounce), z pominięciem pierwszego renderu
    useEffect(() => {
        if (!didMount.current) {
            didMount.current = true;
            return;
        }
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => load(1, search), search === '' ? 0 : 400);
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // numery tras dla widocznych wpisów (tylko poza trybem trasy)
    useEffect(() => {
        if (source.kind === 'tour' || !items || items.length === 0) return;
        const ids = Array.from(new Set(items.map((i) => i.tourId).filter((id) => id > 0)));
        const missing = ids.filter((id) => !routeNrs.some((r) => r.tourId === id));
        if (missing.length === 0) return;
        fetchData<RouteNr[]>(API_ENDPOINTS.getRouteNumbers, { method: 'POST', sendData: { tourIds: ids } }).then((res) => {
            if (Array.isArray(res.responseData)) setRouteNrs((prev) => mergeRouteNrs(prev, res.responseData!));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const onEndReached = useCallback(() => {
        if (!paginated || loadingMoreRef.current || loading || !items) return;
        if (items.length >= totalItems) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
        load(pageRef.current + 1, search);
    }, [paginated, loading, items, totalItems, load, search]);

    const EditComponent = config.EditComponent;
    const closeEdit = useCallback(() => setEditItem(null), []);
    const savedEdit = useCallback(() => {
        setEditItem(null);
        reload();
    }, [reload]);

    if (!items && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {EditComponent && editItem ? (
                <EditComponent key={editItem.id} item={editItem} onClose={closeEdit} onSaved={savedEdit} />
            ) : null}

            {showSearch && (
                <View style={styles.searchBox}>
                    <TextInput
                        style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                        theme={{ colors: { primary: colors.text } }}
                        label={getText('places', 'search', lang)}
                        value={search}
                        onChangeText={setSearch}
                        textColor={colors.text}
                        placeholderTextColor={colors.text}
                        right={search ? <TextInput.Icon icon="close" onPress={() => setSearch('')} /> : undefined}
                    />
                </View>
            )}

            <FlatList
                style={{ backgroundColor: colors.background }}
                contentContainerStyle={styles.list}
                data={items ?? []}
                keyExtractor={(item) => String(item.id)}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={loading && !loadingMore} onRefresh={reload} tintColor={colors.text} />
                }
                ListEmptyComponent={<ThemedText style={styles.empty}>{config.emptyText}</ThemedText>}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
                ListFooterComponent={
                    loadingMore ? (
                        <ActivityIndicator style={{ marginVertical: 16 }} color={colors.text} />
                    ) : paginated && items && items.length > 0 && items.length >= totalItems ? (
                        <ThemedText style={styles.end}>— {totalItems} —</ThemedText>
                    ) : null
                }
                renderItem={({ item }) => {
                    const expanded = expandedId === item.id;
                    const tourNr =
                        source.kind !== 'tour' ? routeNrs.find((r) => r.tourId === item.tourId)?.tourNr : undefined;
                    const canExpand = !!config.renderDetails || !!EditComponent;
                    return (
                        <Pressable
                            onPress={() => canExpand && setExpandedId(expanded ? null : item.id)}
                            disabled={!canExpand}
                        >
                            <Card>
                                {tourNr !== undefined && (
                                    <ThemedText style={styles.tourTag}>
                                        {getText('places', 'logTour', lang)} {tourNr}
                                    </ThemedText>
                                )}
                                {config.renderSummary(item)}

                                {expanded && (
                                    <View style={styles.details}>
                                        {config.renderDetails?.(item)}
                                        {EditComponent && (
                                            <Pressable onPress={() => setEditItem(item)} style={styles.editRow}>
                                                <Icon source="pencil" size={20} color={colors.actionIcon} />
                                                <ThemedText>{getText('tours', 'editRecord', lang)}</ThemedText>
                                            </Pressable>
                                        )}
                                    </View>
                                )}
                            </Card>
                        </Pressable>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    end: { textAlign: 'center', marginVertical: 16, opacity: 0.6 },
    searchBox: { paddingHorizontal: 12, paddingTop: 6 },
    tourTag: { fontSize: 12, opacity: 0.7, marginBottom: 2 },
    details: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.4)',
        gap: 8,
    },
    editRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
});
