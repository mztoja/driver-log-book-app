import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { TourInterface, ToursInterface } from '@/types';
import { Card, Row } from '@/components/tours/DetailCard';
import { calcSecondsFromTime } from '@/utils/calcSecondsFromTime';
import { addTimes } from '@/utils/addTimes';
import { formatTimeToTime } from '@/utils/formats/formatTimeToTime';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';
import { formatFuelCombustion } from '@/utils/formats/formatFuelCombustion';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatAmount } from '@/utils/formats/formatAmount';

/**
 * Podsumowanie tras nierozliczonych – odpowiednik wiersza `TableView__summary` w ToursList na froncie
 * (te same sumy). Średnia waga ważona liczbą ładunków, nie prosta średnia ze średnich tras.
 */
export const TourTotalsCard: React.FC<{ data: TourInterface[] }> = ({ data }) => {
    const { lang } = useGlobalState();
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);

    const totals = data.reduce((acc, tour) => ({
        driveTimeSeconds: acc.driveTimeSeconds + calcSecondsFromTime(tour.driveTime),
        workTimeSeconds: acc.workTimeSeconds + calcSecondsFromTime(tour.workTime),
        daysOnDuty: acc.daysOnDuty + Number(tour.daysOnDuty),
        daysOffDuty: acc.daysOffDuty + Number(tour.daysOffDuty),
        burnedFuelComp: acc.burnedFuelComp + Number(tour.burnedFuelComp),
        burnedFuelReal: acc.burnedFuelReal + Number(tour.burnedFuelReal),
        totalRefuel: acc.totalRefuel + Number(tour.totalRefuel),
        weightedLoadWeight: acc.weightedLoadWeight + Number(tour.avgWeight) * Number(tour.numberOfLoads),
        numberOfLoads: acc.numberOfLoads + Number(tour.numberOfLoads),
        distance: acc.distance + Number(tour.distance),
        expectedSalary: acc.expectedSalary + Number(tour.expectedSalary),
        outgoings: acc.outgoings + Number(tour.outgoings),
    }), {
        driveTimeSeconds: 0, workTimeSeconds: 0, daysOnDuty: 0, daysOffDuty: 0,
        burnedFuelComp: 0, burnedFuelReal: 0, totalRefuel: 0, weightedLoadWeight: 0, numberOfLoads: 0,
        distance: 0, expectedSalary: 0, outgoings: 0,
    });
    // trasa w trakcie ma currency '' (ustawiane dopiero przy zakończeniu) – bierzemy pierwszą niepustą
    const currency = data.find((tour) => tour.currency)?.currency ?? '';
    const avgWeight = totals.numberOfLoads > 0 ? totals.weightedLoadWeight / totals.numberOfLoads : 0;

    return (
        <View style={styles.wrap}>
            <Card title={t('statsTotal')}>
                <Row label={t('driveTime')} value={formatTimeToTime(addTimes('00:00', totals.driveTimeSeconds))} />
                <Row label={t('workTime')} value={formatTimeToTime(addTimes('00:00', totals.workTimeSeconds))} />
                <Row label={`${t('onDuty')} / ${t('offDuty')}`} value={`${totals.daysOnDuty} / ${totals.daysOffDuty}`} />
                <Row label={`${t('burned')} (${t('boardComputer')})`} value={formatFuelQuantity(totals.burnedFuelComp)} />
                <Row label={`${t('burned')} (${t('real')})`} value={formatFuelQuantity(totals.burnedFuelReal)} />
                <Row label={t('refueled')} value={formatFuelQuantity(totals.totalRefuel, 'twoDecimals')} />
                <Row label={t('fuelUsage')} value={formatFuelCombustion(totals.burnedFuelReal, totals.distance)} />
                <Row label={`${t('averageLoadWeight')} (${t('numberOfLoads')})`} value={`${formatWeight(Math.round(avgWeight))} (${totals.numberOfLoads})`} />
                <Row label={t('distance')} value={formatOdometer(totals.distance)} />
                <Row label={`${t('salary')} (${t('predicted')})`} value={formatAmount(totals.expectedSalary, currency)} />
                <Row label={t('outgoings')} value={formatAmount(totals.outgoings, currency)} />
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { marginTop: 6 },
});
