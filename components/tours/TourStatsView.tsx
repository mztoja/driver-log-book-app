import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { Card, Row, Kpi } from '@/components/tours/DetailCard';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { LangInterface, TourStatsBucket, TourStatsInterface, ToursInterface } from '@/types';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatBigTime } from '@/utils/formats/formatBigTime';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';
import { formatFuelCombustion } from '@/utils/formats/formatFuelCombustion';

const MONTHS_SHORT: Record<LangInterface, string[]> = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    pl: ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze', 'lip', 'sie', 'wrz', 'paź', 'lis', 'gru'],
};

const CHART_HEIGHT = 110;

const workHours = (hm: string): number => {
    const [h, m] = (hm ?? '0:00').split(':');
    return Number(h) + Number(m) / 60;
};

const BucketView: React.FC<{ b: TourStatsBucket; currency: string; lang: LangInterface }> = ({ b, currency, lang }) => {
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    const amount = (v: number) => formatAmount(v, currency);
    const hasSalary = b.salary > 0;
    const rate = (d: number) => (hasSalary && d > 0 ? amount(b.salary / d) : t('na'));
    const totalDays = b.daysOnDuty + b.daysOffDuty;
    return (
        <View style={{ gap: 12 }}>
            <View style={styles.kpis}>
                <Kpi label={t('tours')} value={String(b.toursCount)} />
                <Kpi label={t('distance')} value={formatOdometer(b.distance)} />
                <Kpi label={t('fuelUsage')} value={formatFuelCombustion(b.burnedFuelReal, b.distance)} />
                <Kpi label={hasSalary ? t('salary') : `${t('salary')} (${t('predicted')})`} value={amount(hasSalary ? b.salary : b.expectedSalary)} />
                <Kpi label={t('outgoings')} value={amount(b.outgoings)} />
            </View>
            <Card title={t('sectionTime')}>
                <Row label={t('driveTime')} value={formatBigTime(b.driveTime)} />
                <Row label={t('workTime')} value={formatBigTime(b.workTime)} />
                <Row label={`${t('onDuty')} / ${t('offDuty')}`} value={`${b.daysOnDuty} / ${b.daysOffDuty} (${totalDays})`} />
            </Card>
            <Card title={t('sectionFuel')}>
                <Row label={`${t('burned')} (${t('boardComputer')})`} value={formatFuelQuantity(b.burnedFuelComp)} />
                <Row label={`${t('burned')} (${t('real')})`} value={formatFuelQuantity(b.burnedFuelReal)} />
                <Row label={t('refueled')} value={formatFuelQuantity(b.totalRefuel, 'twoDecimals')} />
                <Row label={t('fuelUsage')} value={formatFuelCombustion(b.burnedFuelReal, b.distance)} />
            </Card>
            <Card title={t('sectionLoads')}>
                <Row label={t('numberOfLoads')} value={String(b.numberOfLoads)} />
                <Row label={t('averageLoadWeight')} value={formatWeight(b.avgWeight)} />
                <Row label={t('distance')} value={formatOdometer(b.distance)} />
            </Card>
            <Card title={t('sectionSalary')}>
                <Row label={`${t('salary')} (${t('predicted')})`} value={amount(b.expectedSalary)} />
                <Row label={`${t('salary')} (${t('real')})`} value={amount(b.salary)} />
                <Row label={`${t('rate')} (${t('perKm')})`} value={rate(b.distance)} />
                <Row label={`${t('rate')} (${t('perHour')})`} value={rate(workHours(b.workTime))} />
                <Row label={`${t('rate')} (${t('perDay')})`} value={rate(totalDays)} />
                <Row label={t('outgoings')} value={amount(b.outgoings)} />
            </Card>
        </View>
    );
};

export const TourStatsView: React.FC = () => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const [data, setData] = useState<TourStatsInterface | null>(null);
    const [yearIdx, setYearIdx] = useState<number>(0);

    useFocusEffect(
        useCallback(() => {
            fetchData<TourStatsInterface>(API_ENDPOINTS.getRouteStats, { setData });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [])
    );

    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    const year = data?.years[yearIdx] ?? null;

    const chart = useMemo(() => {
        if (!year) return null;
        const maxDist = Math.max(1, ...year.months.map((m) => m.distance));
        const maxSalary = Math.max(1, ...year.months.map((m) => (m.salary > 0 ? m.salary : m.expectedSalary)));
        return year.months.map((m) => {
            const salary = m.salary > 0 ? m.salary : m.expectedSalary;
            return { month: m.month, distPct: (m.distance / maxDist) * 100, salaryPct: (salary / maxSalary) * 100 };
        });
    }, [year]);

    if (!data && loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    if (!data || data.years.length === 0 || !year) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ThemedText style={{ opacity: 0.7 }}>{t('statsNoData')}</ThemedText>
            </View>
        );
    }

    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
            <View style={styles.yearBar}>
                <IconButton
                    icon="chevron-left"
                    iconColor={colors.text}
                    disabled={yearIdx >= data.years.length - 1}
                    onPress={() => setYearIdx((i) => i + 1)}
                />
                <ThemedText type="subtitle">{year.year}</ThemedText>
                <IconButton
                    icon="chevron-right"
                    iconColor={colors.text}
                    disabled={yearIdx <= 0}
                    onPress={() => setYearIdx((i) => i - 1)}
                />
            </View>

            <BucketView b={year} currency={data.currency} lang={lang} />

            {chart &&
                <Card title={t('statsByMonth')}>
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.swatch, { backgroundColor: colors.actionIcon }]} />
                            <ThemedText style={styles.legendText}>{t('distance')}</ThemedText>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.swatch, { backgroundColor: colors.tabIconSelected }]} />
                            <ThemedText style={styles.legendText}>{t('salary')}</ThemedText>
                        </View>
                    </View>
                    <View style={styles.bars}>
                        {chart.map((c) => (
                            <View key={c.month} style={styles.barGroup}>
                                <View style={styles.barPair}>
                                    <View style={[styles.bar, { height: Math.max(2, (c.distPct / 100) * CHART_HEIGHT), backgroundColor: colors.actionIcon }]} />
                                    <View style={[styles.bar, { height: Math.max(2, (c.salaryPct / 100) * CHART_HEIGHT), backgroundColor: colors.tabIconSelected }]} />
                                </View>
                                <ThemedText style={styles.barLabel}>{MONTHS_SHORT[lang][c.month - 1]}</ThemedText>
                            </View>
                        ))}
                    </View>
                </Card>
            }

            <Card title={t('statsTotal')}>
                <BucketView b={data.total} currency={data.currency} lang={lang} />
            </Card>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    content: { padding: 12, gap: 12, paddingBottom: 32 },
    kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    yearBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    legend: { flexDirection: 'row', gap: 16, marginTop: 4, marginBottom: 8 },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    swatch: { width: 12, height: 12, borderRadius: 2 },
    legendText: { fontSize: 12 },
    bars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    barGroup: { flex: 1, alignItems: 'center', gap: 4 },
    barPair: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: CHART_HEIGHT },
    bar: { width: 6, borderRadius: 2 },
    barLabel: { fontSize: 9, opacity: 0.7 },
});
