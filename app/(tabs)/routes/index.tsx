import { useCallback, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { TourInterface, ToursInterface } from '@/types';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { SegmentedTabs } from '@/components/tours/SegmentedTabs';
import { TourList } from '@/components/tours/TourList';
import { TourSettlementsView } from '@/components/tours/TourSettlementsView';
import { TourStatsView } from '@/components/tours/TourStatsView';

type Tab = 'unaccounted' | 'settled' | 'stats';

function UnaccountedTours() {
    const { fetchData, loading } = useApi();
    const { lang } = useGlobalState();
    const [data, setData] = useState<TourInterface[] | null>(null);

    const load = useCallback(() => {
        fetchData<TourInterface[]>(API_ENDPOINTS.getRoutes, { setData });
    }, [fetchData]);

    useFocusEffect(
        useCallback(() => {
            load();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    return <TourList data={data} loading={loading} onRefresh={load} emptyText={getText('tours', 'noTours', lang)} />;
}

export default function RoutesScreen() {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const [tab, setTab] = useState<Tab>('unaccounted');
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SegmentedTabs<Tab>
                value={tab}
                onChange={setTab}
                tabs={[
                    { key: 'unaccounted', label: t('tabUnaccounted') },
                    { key: 'settled', label: t('tabSettled') },
                    { key: 'stats', label: t('tabStats') },
                ]}
            />
            <View style={styles.body}>
                {tab === 'unaccounted' && <UnaccountedTours />}
                {tab === 'settled' && <TourSettlementsView />}
                {tab === 'stats' && <TourStatsView />}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    body: { flex: 1 },
});
