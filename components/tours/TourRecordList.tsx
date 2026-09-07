import React, { useCallback, useState } from 'react';
import { FlatList, View, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/tours/DetailCard';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';

interface Props<T> {
    endpoint: string;
    renderItem: (item: T) => React.ReactNode;
}

export function TourRecordList<T extends { id: number }>({ endpoint, renderItem }: Props<T>): JSX.Element {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const [data, setData] = useState<T[] | null>(null);

    const load = useCallback(() => {
        fetchData<T[]>(`${endpoint}/${id}`, { setData });
    }, [endpoint, id, fetchData]);

    useFocusEffect(
        useCallback(() => {
            load();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [id])
    );

    if (!data && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <FlatList
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={styles.list}
            data={data ?? []}
            keyExtractor={(item) => String(item.id)}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.text} />}
            ListEmptyComponent={<ThemedText style={styles.empty}>{getText('tours', 'noRecords', lang)}</ThemedText>}
            renderItem={({ item }) => <Card>{renderItem(item)}</Card>}
        />
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
});
