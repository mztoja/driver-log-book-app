import { useMemo } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { PlaceLogsList } from '@/components/places/PlaceLogsList';

export default function PlaceLogsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { places, lang } = useGlobalState();
    const placeId = Number(id);

    const title = useMemo(() => {
        const place = places?.find((p) => p.id === placeId);
        return place
            ? getText('places', 'placeLogsHeader', lang, `${place.name} - ${place.city}`)
            : getText('places', 'showActivities', lang);
    }, [places, placeId, lang]);

    return (
        <>
            <Stack.Screen options={{ title }} />
            <PlaceLogsList placeId={placeId} />
        </>
    );
}
