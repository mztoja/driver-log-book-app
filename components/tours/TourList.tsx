import React from 'react';
import { FlatList, Pressable, StyleSheet, View, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { TourInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatFuelCombustion } from '@/utils/formats/formatFuelCombustion';

interface Props {
    data: TourInterface[] | null;
    loading: boolean;
    onRefresh: () => void;
    emptyText: string;
    ListHeaderComponent?: React.ReactElement;
}

export const TourList: React.FC<Props> = ({ data, loading, onRefresh, emptyText, ListHeaderComponent }) => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();

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
            keyExtractor={(t) => t.id.toString()}
            ListHeaderComponent={ListHeaderComponent}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.text} />}
            ListEmptyComponent={<ThemedText style={styles.empty}>{emptyText}</ThemedText>}
            renderItem={({ item }) => {
                const salary = Number(item.salary) > 0 ? Number(item.salary) : Number(item.expectedSalary);
                const salaryTag = Number(item.salary) > 0 ? '' : ` (${getText('tours', 'predicted', lang)})`;
                return (
                    <Pressable
                        onPress={() => router.push(`/routes/${item.id}`)}
                        style={({ pressed }) => [
                            styles.card,
                            { backgroundColor: colors.inputBackground, borderColor: colors.headerBackground, opacity: pressed ? 0.7 : 1 },
                        ]}
                    >
                        <View style={styles.cardHead}>
                            <ThemedText type="defaultSemiBold" style={styles.tourNr}>
                                {getText('tours', 'tour', lang)} {item.tourNr}
                            </ThemedText>
                            <ThemedText style={styles.truck}>{item.truck}</ThemedText>
                        </View>
                        <ThemedText style={styles.dates}>
                            {item.startLogData ? formatDate(item.startLogData.date, lang) : getText('tours', 'na', lang)}
                            {'  →  '}
                            {item.stopLogData ? formatDate(item.stopLogData.date, lang) : getText('tours', 'na', lang)}
                        </ThemedText>
                        <View style={styles.cardMeta}>
                            <ThemedText style={styles.metaItem}>{formatOdometer(item.distance)}</ThemedText>
                            <ThemedText style={styles.metaItem}>{formatFuelCombustion(Number(item.burnedFuelReal), item.distance)}</ThemedText>
                            <ThemedText type="defaultSemiBold" style={styles.metaItem}>
                                {formatAmount(salary, item.currency)}{salaryTag}
                            </ThemedText>
                        </View>
                    </Pressable>
                );
            }}
        />
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    empty: { textAlign: 'center', marginTop: 40, opacity: 0.7 },
    card: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 6 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    tourNr: { fontSize: 17 },
    truck: { opacity: 0.8 },
    dates: { opacity: 0.85, fontSize: 13 },
    cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 2 },
    metaItem: { fontSize: 13 },
});
