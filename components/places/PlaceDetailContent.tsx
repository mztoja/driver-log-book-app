import React, { JSX } from 'react';
import { View, StyleSheet, Pressable, Linking } from 'react-native';
import { router } from 'expo-router';
import { Icon } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import { getText } from '@/utils/getText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { PlaceInterface, PlacesInterface } from '@/types';

const openMaps = (query: string): void => {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`);
};

interface Props {
    place: PlaceInterface;
    onEdit: (place: PlaceInterface) => void;
    // wołane przed nawigacją do czynności miejsca (np. zamknięcie modala na mapie)
    onNavigate?: () => void;
}

/**
 * Szczegóły miejsca (GPS, opis, akcje) – odpowiednik front `PlaceDetailCard`: lista i mapa
 * pokazują dokładnie tę samą treść po wybraniu miejsca.
 */
export const PlaceDetailContent: React.FC<Props> = ({ place, onEdit, onNavigate }): JSX.Element => {
    const { colors } = useTheme();
    const { fetchData } = useApi();
    const { showSnackbar } = useSnackbar();
    const { lang, user, setUser } = useGlobalState();
    const t = (k: keyof PlacesInterface['en']) => getText('places', k, lang);
    const hasGps = Number(place.lat) > 0.00001 || Number(place.lon) > 0.00001;

    const markPlace = (): void => {
        fetchData(API_ENDPOINTS.markDepart, { method: 'PATCH', sendData: { placeId: place.id } }).then((res) => {
            if (res.success) {
                showSnackbar(`${t('markedSuccess')} ${place.name} - ${place.city}`, 'success');
                if (user) setUser({ ...user, markedDepart: place.id });
            } else {
                showSnackbar(t('markedError'), 'warning');
            }
        });
    };

    return (
        <View style={styles.wrap}>
            {hasGps && (
                <ThemedText style={styles.dim}>
                    {t('gps')}: {place.lat}, {place.lon}
                </ThemedText>
            )}
            {!!place.description && <ThemedText style={styles.desc}>{place.description}</ThemedText>}

            <View style={styles.actions}>
                <ActionRow
                    icon="directions"
                    label={t('openInMaps')}
                    color={colors.actionIcon}
                    onPress={() => openMaps(`${place.street} ${place.code} ${place.city} ${place.country}`)}
                />
                {hasGps && (
                    <ActionRow
                        icon="crosshairs-gps"
                        label={t('openGps')}
                        color={colors.actionIcon}
                        onPress={() => openMaps(`${place.lat}, ${place.lon}`)}
                    />
                )}
                <ActionRow icon="navigation-variant" label={t('markAsDestination')} color={colors.actionIcon} onPress={markPlace} />
                <ActionRow icon="pencil" label={t('edit')} color={colors.actionIcon} onPress={() => onEdit(place)} />
                <ActionRow
                    icon="clipboard-text-outline"
                    label={t('showActivities')}
                    color={colors.actionIcon}
                    onPress={() => {
                        onNavigate?.();
                        router.push(`/places/${place.id}/logs`);
                    }}
                />
            </View>
        </View>
    );
};

export const ActionRow: React.FC<{ icon: string; label: string; color: string; onPress: () => void }> = ({
    icon,
    label,
    color,
    onPress,
}) => {
    const { colors } = useTheme();
    return (
        <Pressable onPress={onPress} style={styles.actionRow}>
            <Icon source={icon} size={20} color={color} />
            <ThemedText style={{ color: colors.text, flexShrink: 1 }}>{label}</ThemedText>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    dim: { opacity: 0.8, fontSize: 13 },
    desc: { opacity: 0.9 },
    actions: { marginTop: 4, gap: 2 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
});
