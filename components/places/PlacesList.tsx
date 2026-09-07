import React, { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, Linking, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { Icon, IconButton, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';
import { formatCountry } from '@/utils/formats/formatCountry';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { CommonInterface, PlaceInterface, PlacesInterface } from '@/types';
import { STYLES } from '@/constants/STYLES';
import { PlaceTypeSelect } from '@/components/places/PlaceTypeSelect';
import { CountrySelect } from '@/components/inputs/address/CountrySelect';
import { PlaceFormModal } from '@/components/places/PlaceFormModal';

const openMaps = (query: string): void => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
};

export const PlacesList: React.FC = (): JSX.Element => {
    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const { lang, user, setUser, places, setPlaces } = useGlobalState();

    const t = (k: keyof PlacesInterface['en']) => getText('places', k, lang);

    const [filterType, setFilterType] = useState<string>('999');
    const [filterCountry, setFilterCountry] = useState<string>(user?.country ?? '');
    const [search, setSearch] = useState<string>('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [addVisible, setAddVisible] = useState<boolean>(false);
    const [editPlace, setEditPlace] = useState<PlaceInterface | null>(null);

    const load = useCallback(() => {
        fetchData<PlaceInterface[]>(API_ENDPOINTS.GET_PLACES, { setData: setPlaces });
    }, [fetchData, setPlaces]);

    useFocusEffect(
        useCallback(() => {
            load();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []),
    );

    const shown = useMemo<PlaceInterface[]>(() => {
        if (!places) return [];
        if (search.trim().length > 1) {
            const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
            return places.filter(
                (p) =>
                    re.test(p.name) ||
                    re.test(p.city) ||
                    re.test(p.street) ||
                    re.test(p.code) ||
                    re.test(p.description ?? ''),
            );
        }
        return places.filter((p) => {
            if (filterCountry && p.country !== filterCountry) return false;
            if (filterType !== '999' && p.type !== Number(filterType)) return false;
            return true;
        });
    }, [places, search, filterCountry, filterType]);

    const markPlace = (place: PlaceInterface): void => {
        fetchData(API_ENDPOINTS.markDepart, { method: 'PATCH', sendData: { placeId: place.id } }).then((res) => {
            if (res.success) {
                showSnackbar(`${t('markedSuccess')} ${place.name} - ${place.city}`, 'success');
                if (user) setUser({ ...user, markedDepart: place.id });
            } else {
                showSnackbar(t('markedError'), 'warning');
            }
        });
    };

    const typeName = (type: number): string =>
        getText('common', `placeType${type}` as keyof CommonInterface['en'], lang);

    if (!places && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    if (!places) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ThemedText style={{ textAlign: 'center', padding: 20 }}>{t('apiError')}</ThemedText>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <PlaceFormModal
                key={addVisible ? 'add-open' : 'add'}
                visible={addVisible}
                onClose={() => setAddVisible(false)}
                onSaved={load}
            />
            <PlaceFormModal
                key={editPlace?.id ?? 'edit'}
                visible={editPlace !== null}
                onClose={() => setEditPlace(null)}
                place={editPlace}
                onSaved={load}
            />

            <View style={styles.filters}>
                <View style={styles.filterRow}>
                    <View style={styles.filterHalf}>
                        <PlaceTypeSelect value={filterType} displayAll onChange={setFilterType} label={t('filterType')} />
                    </View>
                    <View style={styles.filterHalf}>
                        <CountrySelect value={filterCountry} onChange={setFilterCountry} />
                    </View>
                </View>
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
                data={shown}
                keyExtractor={(p) => p.id.toString()}
                keyboardShouldPersistTaps="handled"
                refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.text} />}
                ListEmptyComponent={<ThemedText style={styles.empty}>{t('empty')}</ThemedText>}
                renderItem={({ item }) => {
                    const expanded = expandedId === item.id;
                    const hasGps = Number(item.lat) > 0.00001 || Number(item.lon) > 0.00001;
                    return (
                        <Pressable
                            onPress={() => setExpandedId(expanded ? null : item.id)}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: colors.inputBackground,
                                    borderColor: item.isFavorite ? colors.actionIcon : colors.headerBackground,
                                },
                            ]}
                        >
                            <View style={styles.cardHead}>
                                <ThemedText type="defaultSemiBold" style={{ flexShrink: 1 }}>
                                    {item.name} {item.street ? `- ${item.street}` : ''}
                                </ThemedText>
                                <View style={styles.cardHeadIcons}>
                                    {!!item.description && <Icon source="text-box-outline" size={16} color={colors.text} />}
                                    {hasGps && <Icon source="map-marker" size={16} color={colors.text} />}
                                </View>
                            </View>
                            <ThemedText style={styles.dim}>
                                {formatCountry(item.country, lang)}
                                {'  ·  '}
                                {item.code} {item.city}
                            </ThemedText>
                            <ThemedText style={styles.type}>{typeName(item.type)}</ThemedText>

                            {expanded && (
                                <View style={styles.details}>
                                    {hasGps && (
                                        <ThemedText style={styles.dim}>
                                            {t('gps')}: {item.lat}, {item.lon}
                                        </ThemedText>
                                    )}
                                    {!!item.description && (
                                        <ThemedText style={styles.desc}>{item.description}</ThemedText>
                                    )}

                                    <View style={styles.actions}>
                                        <ActionRow
                                            icon="directions"
                                            label={`${t('openInMaps')}`}
                                            color={colors.actionIcon}
                                            onPress={() => openMaps(`${item.street} ${item.code} ${item.city} ${item.country}`)}
                                        />
                                        {hasGps && (
                                            <ActionRow
                                                icon="crosshairs-gps"
                                                label={t('openGps')}
                                                color={colors.actionIcon}
                                                onPress={() => openMaps(`${item.lat}, ${item.lon}`)}
                                            />
                                        )}
                                        <ActionRow
                                            icon="navigation-variant"
                                            label={t('markAsDestination')}
                                            color={colors.actionIcon}
                                            onPress={() => markPlace(item)}
                                        />
                                        <ActionRow
                                            icon="pencil"
                                            label={t('edit')}
                                            color={colors.actionIcon}
                                            onPress={() => setEditPlace(item)}
                                        />
                                        <ActionRow
                                            icon="clipboard-text-outline"
                                            label={t('showActivities')}
                                            color={colors.actionIcon}
                                            onPress={() => router.push(`/places/${item.id}/logs`)}
                                        />
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

const ActionRow: React.FC<{ icon: string; label: string; color: string; onPress: () => void }> = ({
    icon,
    label,
    color,
    onPress,
}) => {
    const { colors } = useTheme();
    return (
        <Pressable onPress={onPress} style={styles.actionRow}>
            <Icon source={icon} size={20} color={color} />
            <ThemedText style={{ color: colors.text }}>{label}</ThemedText>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, gap: 10, flexGrow: 1, paddingBottom: 90 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    filters: { gap: 4, paddingHorizontal: 12, paddingTop: 6 },
    filterRow: { flexDirection: 'row', gap: 8 },
    filterHalf: { flex: 1 },
    card: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 3 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    cardHeadIcons: { flexDirection: 'row', gap: 4 },
    dim: { opacity: 0.8, fontSize: 13 },
    type: { opacity: 0.6, fontSize: 12 },
    details: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(128,128,128,0.4)',
        gap: 6,
    },
    desc: { opacity: 0.9 },
    actions: { marginTop: 4, gap: 2 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
    fab: { position: 'absolute', right: 16, bottom: 24, borderRadius: 30 },
});
