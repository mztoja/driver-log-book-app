import React, { JSX } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { formatDate } from '@/utils/formats/formatDate';
import { FriendCargoInterface, FriendPositionInterface, FriendsInterface } from '@/types';

/** Blok „Ostatnia pozycja" + „Cel" – wspólny dla mapy i listy znajomych (jak front FriendPositionInfo). */
export const FriendPositionInfo: React.FC<{
    position: FriendPositionInterface | null;
    cargo: FriendCargoInterface | null;
}> = ({ position, cargo }): JSX.Element => {
    const { lang } = useGlobalState();
    const f = (k: keyof FriendsInterface['en']) => getText('friends', k, lang);
    return (
        <View style={{ gap: 2 }}>
            <ThemedText style={styles.label}>{f('lastPositionLabel')}</ThemedText>
            <ThemedText>
                {position
                    ? `${formatDate(position.date, lang)} - ${position.placeName}${position.city ? ' - ' + position.city : ''}`
                    : f('noPosition')}
            </ThemedText>
            <ThemedText style={[styles.label, { marginTop: 6 }]}>{f('currentCargoLabel')}</ThemedText>
            {cargo && (cargo.targetPlace || cargo.destinations.length > 0)
                ? <>
                    {!!cargo.targetPlace && <ThemedText>{f('targetPlaceLabel')}: {cargo.targetPlace}</ThemedText>}
                    {cargo.destinations.length > 0 &&
                        <ThemedText>{f('loadDestinationsLabel')}: {cargo.destinations.join(', ')}</ThemedText>}
                </>
                : <ThemedText>{f('noActiveTour')}</ThemedText>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    label: { opacity: 0.7, fontSize: 13 },
});
