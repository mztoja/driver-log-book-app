import React, { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Icon, IconButton } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { STYLES } from '@/constants/STYLES';
import {
    CommonInterface,
    FriendsInterface,
    FriendsListInterface,
    FriendSummaryInterface,
    PlaceInterface,
    PlacesInterface,
} from '@/types';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import ConfirmModal from '@/components/ConfirmModal';
import { PlaceTypeSelect } from '@/components/places/PlaceTypeSelect';
import { PlaceFormModal } from '@/components/places/PlaceFormModal';
import { PlaceDetailContent, ActionRow } from '@/components/places/PlaceDetailContent';
import { LeafletMap, MapMarker } from '@/components/places/LeafletMap';
import { FriendPositionInfo } from '@/components/places/FriendPositionInfo';
import { AddFriendModal } from '@/components/places/AddFriendModal';

type GeocodeMode = 'full' | 'partial';

const hasLat = (p: PlaceInterface): boolean => Number(p.lat) > 0.001;
const hasLon = (p: PlaceInterface): boolean => Number(p.lon) > 0.001;
const initials = (first: string, last: string): string =>
    `${(first?.[0] ?? '').toUpperCase()}${(last?.[0] ?? '').toUpperCase()}`;

/** Odpowiednik front `PlacesMap` (+ AddFriend): pinezki miejsc i znajomych, geokodowanie, zaproszenia. */
export const PlacesMap: React.FC<{ active?: boolean }> = ({ active }): JSX.Element => {
    const { colors } = useTheme();
    const { fetchData } = useApi();
    const { fetchData: fetchGeocode } = useApi();
    const { showSnackbar } = useSnackbar();
    const { lang, places, setPlaces } = useGlobalState();
    const t = (k: keyof PlacesInterface['en']) => getText('places', k, lang);
    const f = (k: keyof FriendsInterface['en']) => getText('friends', k, lang);

    // jak front: domyślnie tylko znajomi – miejsca trzeba świadomie włączyć
    const [showPlaces, setShowPlaces] = useState<boolean>(false);
    const [showFriends, setShowFriends] = useState<boolean>(true);
    const [filterType, setFilterType] = useState<string>('999');
    const [friends, setFriends] = useState<FriendsListInterface | null>(null);

    const [selectedPlace, setSelectedPlace] = useState<PlaceInterface | null>(null);
    const [editPlace, setEditPlace] = useState<PlaceInterface | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<FriendSummaryInterface | null>(null);
    const [confirmRemove, setConfirmRemove] = useState<boolean>(false);
    const [showSelf, setShowSelf] = useState<boolean>(false);
    const [addFriendVisible, setAddFriendVisible] = useState<boolean>(false);

    const [geocodeConfirm, setGeocodeConfirm] = useState<GeocodeMode | null>(null);
    const [geocodeMode, setGeocodeMode] = useState<GeocodeMode | null>(null);
    const [geocodeDone, setGeocodeDone] = useState<number>(0);
    const [geocodeTotal, setGeocodeTotal] = useState<number>(0);

    const refreshPlaces = useCallback(() => {
        fetchData<PlaceInterface[]>(API_ENDPOINTS.GET_PLACES, { setData: setPlaces });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshFriends = useCallback(() => {
        fetchData<FriendsListInterface>(API_ENDPOINTS.getFriends, { setData: setFriends });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // jak front: przy każdym wejściu – aktualna lista znajomych i oczekujących zaproszeń
    useFocusEffect(useCallback(() => refreshFriends(), [refreshFriends]));

    // mapa zostaje zamontowana w tle – po powrocie z karty Znajomi (dodanie/usunięcie) odśwież pinezki
    useEffect(() => {
        if (active) refreshFriends();
    }, [active, refreshFriends]);

    const allPlaces = useMemo(() => places ?? [], [places]);
    const hiddenCount = useMemo(() => allPlaces.filter((p) => !hasLat(p) && !hasLon(p)).length, [allPlaces]);
    const partialCount = useMemo(() => allPlaces.filter((p) => hasLat(p) !== hasLon(p)).length, [allPlaces]);

    const markers = useMemo<MapMarker[]>(() => {
        const list: MapMarker[] = [];
        if (showPlaces) {
            allPlaces
                .filter((p) => hasLat(p) || hasLon(p))
                .filter((p) => Number(filterType) === 999 || p.type === Number(filterType))
                .forEach((p) => list.push({
                    kind: 'place', id: p.id, lat: Number(p.lat), lon: Number(p.lon), type: p.type,
                    partial: hasLat(p) !== hasLon(p),
                }));
        }
        if (showFriends && friends) {
            friends.accepted.filter((fr) => fr.position).forEach((fr) => list.push({
                kind: 'friend', id: fr.friendshipId, lat: fr.position!.lat, lon: fr.position!.lon,
                initials: initials(fr.firstName, fr.lastName), onTour: !!fr.cargo?.activeTour,
            }));
            if (friends.self.position) {
                list.push({
                    kind: 'self', id: 0, lat: friends.self.position.lat, lon: friends.self.position.lon,
                    initials: initials(friends.self.firstName, friends.self.lastName),
                    onTour: !!friends.self.cargo?.activeTour,
                });
            }
        }
        return list;
    }, [showPlaces, showFriends, filterType, allPlaces, friends]);

    const onMarkerPress = (kind: MapMarker['kind'], id: number): void => {
        if (kind === 'place') setSelectedPlace(allPlaces.find((p) => p.id === id) ?? null);
        if (kind === 'friend') setSelectedFriend(friends?.accepted.find((fr) => fr.friendshipId === id) ?? null);
        if (kind === 'self') setShowSelf(true);
    };

    // accept/decline zwracają pustą odpowiedź (success=false w useApi) – jak front: po prostu odświeżamy
    const respond = (friendshipId: number, accept: boolean): void => {
        const path = accept ? API_ENDPOINTS.acceptFriendRequest : API_ENDPOINTS.declineFriendRequest;
        fetchData(path, { method: 'POST', sendData: { id: friendshipId } }).finally(refreshFriends);
    };

    const removeFriend = (): void => {
        if (!selectedFriend) return;
        setConfirmRemove(false);
        fetchData(API_ENDPOINTS.declineFriendRequest, { method: 'POST', sendData: { id: selectedFriend.friendshipId } })
            .finally(() => {
                refreshFriends();
                setSelectedFriend(null);
            });
    };

    // Jak front PlacesContext.startGeocode: backend geokoduje po jednym miejscu; każda iteracja
    // trwale zdejmuje jedno miejsce z puli (udane znika, nieudane trafia do excludeIds).
    const runGeocode = async (mode: GeocodeMode): Promise<void> => {
        setGeocodeConfirm(null);
        if (geocodeMode) return;
        const total = mode === 'full' ? hiddenCount : partialCount;
        setGeocodeMode(mode);
        setGeocodeTotal(total);
        setGeocodeDone(0);
        const excludeIds: number[] = [];
        let geocoded = 0;
        let failed = 0;
        while (true) {
            const res = await fetchGeocode<{ finished: boolean; placeId?: number; success?: boolean }>(
                API_ENDPOINTS.geocodeNextPlace,
                { method: 'POST', sendData: { excludeIds, mode } },
                { showSnackbar },
            );
            if (!res.success || !res.responseData || res.responseData.finished) break;
            if (res.responseData.placeId !== undefined) excludeIds.push(res.responseData.placeId);
            if (res.responseData.success) geocoded++;
            else failed++;
            setGeocodeDone((prev) => prev + 1);
        }
        setGeocodeMode(null);
        showSnackbar(
            getText('places', 'mapGeocodeFound', lang, String(geocoded)) +
            (failed > 0 ? getText('places', 'mapGeocodeFailed', lang, String(failed)) : ''),
            'success',
        );
        refreshPlaces();
    };

    const typeName = (type: number): string =>
        getText('common', `placeType${type}` as keyof CommonInterface['en'], lang);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* szczegóły miejsca – ta sama treść co na liście */}
            <MainFormModal
                visible={selectedPlace !== null}
                setVisible={() => setSelectedPlace(null)}
                title={selectedPlace ? `${selectedPlace.name} - ${selectedPlace.city}` : ''}
            >
                {selectedPlace &&
                    <ScrollView style={STYLES.scrollView} contentContainerStyle={styles.modalContent}>
                        <ThemedText>
                            {selectedPlace.street ? `${selectedPlace.street}, ` : ''}
                            {selectedPlace.code} {selectedPlace.city}, {selectedPlace.country}
                        </ThemedText>
                        <ThemedText style={styles.category}>{typeName(selectedPlace.type)}</ThemedText>
                        <PlaceDetailContent
                            place={selectedPlace}
                            onEdit={(p) => {
                                setSelectedPlace(null);
                                setEditPlace(p);
                            }}
                            onNavigate={() => setSelectedPlace(null)}
                        />
                    </ScrollView>
                }
            </MainFormModal>
            <PlaceFormModal
                key={editPlace?.id ?? 'edit'}
                visible={editPlace !== null}
                onClose={() => setEditPlace(null)}
                place={editPlace}
                onSaved={refreshPlaces}
            />

            {/* znajomy */}
            <MainFormModal
                visible={selectedFriend !== null}
                setVisible={() => setSelectedFriend(null)}
                title={selectedFriend ? `${selectedFriend.firstName} ${selectedFriend.lastName}` : ''}
            >
                {selectedFriend &&
                    <ScrollView style={STYLES.scrollView} contentContainerStyle={styles.modalContent}>
                        <FriendPositionInfo position={selectedFriend.position} lastActivity={selectedFriend.lastActivity} cargo={selectedFriend.cargo} />
                        <ActionRow
                            icon="account-remove"
                            label={f('removeFriend')}
                            color={colors.deleteIcon}
                            onPress={() => setConfirmRemove(true)}
                        />
                    </ScrollView>
                }
                <ConfirmModal
                    visible={confirmRemove}
                    text={selectedFriend
                        ? getText('friends', 'removeFriendConfirm', lang, `${selectedFriend.firstName} ${selectedFriend.lastName}`)
                        : ''}
                    onConfirm={removeFriend}
                    onCancel={() => setConfirmRemove(false)}
                />
            </MainFormModal>

            {/* własna pozycja */}
            <MainFormModal
                visible={showSelf && !!friends?.self}
                setVisible={() => setShowSelf(false)}
                title={friends?.self ? `${f('selfLabel')} (${friends.self.firstName} ${friends.self.lastName})` : ''}
            >
                {friends?.self &&
                    <ScrollView style={STYLES.scrollView} contentContainerStyle={styles.modalContent}>
                        <FriendPositionInfo position={friends.self.position} lastActivity={friends.self.lastActivity} cargo={friends.self.cargo} />
                    </ScrollView>
                }
            </MainFormModal>

            <AddFriendModal visible={addFriendVisible} onClose={() => setAddFriendVisible(false)} onInvited={refreshFriends} />

            {/* pełny opis plakietki trafia tutaj – na mapie zostaje tylko zwarta ikonka z licznikiem */}
            <ConfirmModal
                visible={geocodeConfirm !== null}
                text={geocodeConfirm === 'partial'
                    ? `${getText('places', 'mapPartialPlaces', lang, String(partialCount))}\n\n${t('mapGeocodePartialConfirm')}`
                    : `${getText('places', 'mapHiddenPlaces', lang, String(hiddenCount))}\n\n${t('mapGeocodeConfirm')}`}
                onConfirm={() => geocodeConfirm && runGeocode(geocodeConfirm)}
                onCancel={() => setGeocodeConfirm(null)}
            />

            {/* panel sterowania */}
            <View style={styles.controls}>
                <View style={styles.toggleRow}>
                    <LayerToggle
                        icon="account-group"
                        label={f('friendsToggleLabel')}
                        active={showFriends}
                        onPress={() => setShowFriends((v) => !v)}
                    />
                    <LayerToggle
                        icon="map-marker"
                        label={f('placesToggleLabel')}
                        active={showPlaces}
                        onPress={() => setShowPlaces((v) => !v)}
                    />
                    <IconButton
                        icon="account-plus"
                        size={22}
                        mode="contained"
                        containerColor={colors.buttonColor}
                        iconColor={colors.buttonTextColor}
                        onPress={() => setAddFriendVisible(true)}
                        accessibilityLabel={f('addFriend')}
                    />
                </View>
                <PlaceTypeSelect value={filterType} displayAll onChange={setFilterType} label={t('filterType')} />
                {!!friends?.incoming.length && (
                    <View style={[styles.requests, { borderColor: colors.headerBackground }]}>
                        <ThemedText type="defaultSemiBold">{f('incomingRequestsHeader')}</ThemedText>
                        {friends.incoming.map((r) => (
                            <View key={r.friendshipId} style={styles.requestRow}>
                                <ThemedText style={{ flex: 1 }}>{r.firstName} {r.lastName} ({r.email})</ThemedText>
                                <IconButton icon="check" size={20} iconColor={colors.actionIcon}
                                            accessibilityLabel={f('accept')} onPress={() => respond(r.friendshipId, true)} />
                                <IconButton icon="close" size={20} iconColor={colors.deleteIcon}
                                            accessibilityLabel={f('decline')} onPress={() => respond(r.friendshipId, false)} />
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <LeafletMap markers={markers} onMarkerPress={onMarkerPress} />

                {(hiddenCount > 0 || partialCount > 0) && (
                    <View style={styles.badges} pointerEvents="box-none">
                        {hiddenCount > 0 && (
                            <GeocodeBadge
                                icon="map-marker-off"
                                loading={geocodeMode === 'full'}
                                text={geocodeMode === 'full' ? `${geocodeDone}/${geocodeTotal}` : String(hiddenCount)}
                                onPress={() => !geocodeMode && setGeocodeConfirm('full')}
                            />
                        )}
                        {partialCount > 0 && (
                            <GeocodeBadge
                                icon="map-marker-alert"
                                loading={geocodeMode === 'partial'}
                                text={geocodeMode === 'partial' ? `${geocodeDone}/${geocodeTotal}` : String(partialCount)}
                                onPress={() => !geocodeMode && setGeocodeConfirm('partial')}
                            />
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

const LayerToggle: React.FC<{ icon: string; label: string; active: boolean; onPress: () => void }> = ({ icon, label, active, onPress }) => {
    const { colors } = useTheme();
    return (
        <Pressable
            onPress={onPress}
            style={[styles.toggle, {
                backgroundColor: active ? colors.tabIconSelected : colors.inputBackground,
                borderColor: colors.headerBackground,
            }]}
        >
            <Icon source={icon} size={18} color={active ? '#fff' : colors.text} />
            <ThemedText style={active ? { color: '#fff', fontWeight: '700' } : undefined}>{label}</ThemedText>
        </Pressable>
    );
};

/** Zwarta plakietka: ikona + licznik (albo postęp „x/y" w trakcie geokodowania); opis w potwierdzeniu. */
const GeocodeBadge: React.FC<{ icon: string; text: string; loading: boolean; onPress: () => void }> = ({ icon, text, loading, onPress }) => {
    const { colors } = useTheme();
    return (
        <Pressable onPress={onPress} style={[styles.badge, { backgroundColor: colors.background, borderColor: colors.headerBackground }]}>
            {loading
                ? <ActivityIndicator size={14} color={colors.text} />
                : <Icon source={icon} size={16} color={colors.deleteIcon} />}
            <ThemedText style={styles.badgeText}>{text}</ThemedText>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    controls: { paddingHorizontal: 12, paddingTop: 6, gap: 2 },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    toggle: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingVertical: 8, paddingHorizontal: 12, borderRadius: 18, borderWidth: 1,
    },
    requests: { borderWidth: 1, borderRadius: 10, padding: 8, marginBottom: 6 },
    requestRow: { flexDirection: 'row', alignItems: 'center' },
    modalContent: { padding: 16, gap: 6 },
    category: { opacity: 0.7, fontSize: 13 },
    badges: { position: 'absolute', left: 8, bottom: 20, flexDirection: 'row', gap: 6 },
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingVertical: 4, paddingHorizontal: 8, borderRadius: 14, borderWidth: 1,
        opacity: 0.92,
    },
    badgeText: { fontSize: 12, lineHeight: 16, fontWeight: '600' },
});
