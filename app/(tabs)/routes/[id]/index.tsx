import { useCallback, useState } from 'react';
import { ScrollView, View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { MainFormButton } from '@/components/buttons/MainFormButton';
import { Card, Row, Kpi } from '@/components/tours/DetailCard';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { TourInterface, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatTimeToTime } from '@/utils/formats/formatTimeToTime';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';
import { formatFuelCombustion } from '@/utils/formats/formatFuelCombustion';

export default function TourDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const [data, setData] = useState<TourInterface | null>(null);

    useFocusEffect(
        useCallback(() => {
            fetchData<TourInterface>(`${API_ENDPOINTS.getRouteById}/${id}`, { setData });
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [id])
    );

    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);

    if (!data) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                {loading ? <ActivityIndicator size="large" color={colors.text} /> : <ThemedText>{t('apiError')}</ThemedText>}
            </View>
        );
    }

    const hasRealSalary = Number(data.salary) > 0;
    const salaryShown = hasRealSalary ? Number(data.salary) : Number(data.expectedSalary);
    const workHours = Number(data.workTime?.split(':')[0]) + Number(data.workTime?.split(':')[1]) / 60;
    const totalDays = Number(data.daysOnDuty) + Number(data.daysOffDuty);
    const rate = (divisor: number) => (hasRealSalary && divisor > 0 ? formatAmount(Number(data.salary) / divisor, data.currency) : t('na'));

    return (
        <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
            <Stack.Screen options={{ title: `${t('tour')} ${data.tourNr}` }} />

            <View style={styles.head}>
                <ThemedText type="subtitle">{t('tour')} {data.tourNr}</ThemedText>
                <ThemedText style={styles.dates}>
                    {data.startLogData ? formatDate(data.startLogData.date, lang) : t('na')}
                    {'  →  '}
                    {data.stopLogData ? formatDate(data.stopLogData.date, lang) : t('na')}
                </ThemedText>
                <ThemedText style={styles.dim}>{t('truck')}: {data.truck}</ThemedText>
            </View>

            <View style={styles.kpis}>
                <Kpi label={t('distance')} value={formatOdometer(data.distance)} />
                <Kpi label={t('fuelUsage')} value={formatFuelCombustion(Number(data.burnedFuelReal), data.distance)} />
                <Kpi
                    label={hasRealSalary ? t('salary') : `${t('salary')} (${t('predicted')})`}
                    value={formatAmount(salaryShown, data.currency)}
                />
                <Kpi label={t('outgoings')} value={formatAmount(Number(data.outgoings), data.currency)} />
            </View>

            <Card title={t('sectionTime')}>
                <Row label={t('driveTime')} value={formatTimeToTime(data.driveTime)} />
                <Row label={t('workTime')} value={formatTimeToTime(data.workTime)} />
                <Row label={`${t('onDuty')} / ${t('offDuty')}`} value={`${data.daysOnDuty} / ${data.daysOffDuty} (${totalDays})`} />
            </Card>

            <Card title={t('sectionFuel')}>
                <Row label={`${t('fuel')} ${t('before')}`} value={formatFuelQuantity(data.fuelStateBefore)} />
                <Row label={`${t('fuel')} ${t('after')}`} value={formatFuelQuantity(data.fuelStateAfter)} />
                <Row label={`${t('burned')} (${t('boardComputer')})`} value={formatFuelQuantity(data.burnedFuelComp)} />
                <Row label={`${t('burned')} (${t('real')})`} value={formatFuelQuantity(data.burnedFuelReal)} />
                <Row label={t('refueled')} value={formatFuelQuantity(data.totalRefuel, 'twoDecimals')} />
                <Row label={t('fuelUsage')} value={formatFuelCombustion(Number(data.burnedFuelReal), data.distance)} />
            </Card>

            <Card title={t('sectionLoads')}>
                <Row label={t('averageLoadWeight')} value={formatWeight(data.avgWeight)} />
                <Row label={t('numberOfLoads')} value={String(data.numberOfLoads)} />
                <Row label={t('distance')} value={formatOdometer(data.distance)} />
            </Card>

            <Card title={t('sectionSalary')}>
                <Row label={`${t('salary')} (${t('predicted')})`} value={formatAmount(Number(data.expectedSalary), data.currency)} />
                <Row label={`${t('salary')} (${t('real')})`} value={formatAmount(Number(data.salary), data.currency)} />
                <Row label={`${t('rate')} (${t('perKm')})`} value={rate(Number(data.distance))} />
                <Row label={`${t('rate')} (${t('perHour')})`} value={rate(workHours)} />
                <Row label={`${t('rate')} (${t('perDay')})`} value={rate(totalDays)} />
                <Row label={t('outgoings')} value={formatAmount(Number(data.outgoings), data.currency)} />
            </Card>

            {(data.startLogData?.notes || data.stopLogData?.notes) &&
                <Card>
                    {!!data.startLogData?.notes &&
                        <ThemedText style={styles.note}>{t('startNotes')}: {data.startLogData.notes}</ThemedText>}
                    {!!data.stopLogData?.notes &&
                        <ThemedText style={styles.note}>{t('stopNotes')}: {data.stopLogData.notes}</ThemedText>}
                </Card>
            }

            <View style={styles.actions}>
                <MainFormButton onPress={() => router.push(`/routes/${id}/logs`)} text={t('showLogs')} />
                <MainFormButton onPress={() => router.push(`/routes/${id}/days`)} text={t('showDays')} />
                <MainFormButton onPress={() => router.push(`/routes/${id}/finances`)} text={t('showFinances')} />
                <MainFormButton onPress={() => router.push(`/routes/${id}/loads`)} text={t('showLoads')} />
                <MainFormButton onPress={() => showSnackbar(t('generateSoon'), 'info')} text={t('generate')} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
    content: { padding: 12, gap: 12 },
    head: { gap: 4 },
    dates: { fontSize: 13, opacity: 0.85 },
    dim: { opacity: 0.8 },
    kpis: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    note: { opacity: 0.9 },
    actions: { gap: 8, marginTop: 4, marginBottom: 24 },
});
