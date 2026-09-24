import { useState } from 'react';
import { View } from 'react-native';
import { PlacesList } from '@/components/places/PlacesList';
import { PlacesMap } from '@/components/places/PlacesMap';
import { FriendsList } from '@/components/places/FriendsList';
import { SegmentedTabs } from '@/components/tours/SegmentedTabs';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';

type Tab = 'list' | 'map' | 'friends';

export default function PlacesScreen() {
    const { lang } = useGlobalState();
    const { colors } = useTheme();
    const [tab, setTab] = useState<Tab>('list');
    // mapę montujemy przy pierwszym wejściu, potem oba widoki zostają zamontowane (ukrywamy
    // nieaktywny) – jak front (stan w PlacesContext): przełączenie Lista/Mapa nie gubi warstw,
    // filtra, pozycji mapy ani trwającego geokodowania
    const [mapMounted, setMapMounted] = useState<boolean>(false);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SegmentedTabs<Tab>
                value={tab}
                onChange={(k) => {
                    if (k === 'map') setMapMounted(true);
                    setTab(k);
                }}
                tabs={[
                    { key: 'list', label: getText('places', 'listTab', lang) },
                    { key: 'map', label: getText('places', 'mapTab', lang) },
                    { key: 'friends', label: getText('friends', 'friendsTab', lang) },
                ]}
            />
            <View style={{ flex: 1, display: tab === 'list' ? 'flex' : 'none' }}>
                <PlacesList />
            </View>
            {mapMounted &&
                <View style={{ flex: 1, display: tab === 'map' ? 'flex' : 'none' }}>
                    <PlacesMap active={tab === 'map'} />
                </View>
            }
            {tab === 'friends' && <FriendsList />}
        </View>
    );
}
