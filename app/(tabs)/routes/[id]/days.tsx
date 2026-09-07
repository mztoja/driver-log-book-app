import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { TourRecordList } from '@/components/tours/TourRecordList';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { DayInterface, dayCardStateEnum, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatTimeToTime } from '@/utils/formats/formatTimeToTime';
import { formatFuelQuantity } from '@/utils/formats/formatFuelQuantity';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';

export default function TourDaysScreen() {
    const { lang } = useGlobalState();
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);

    return (
        <TourRecordList
            endpoint={API_ENDPOINTS.getDaysByTourId}
            renderItem={(day: DayInterface) => (
                <View style={{ gap: 3 }}>
                    <ThemedText type="defaultSemiBold">
                        {day.startData ? formatDate(day.startData.date, lang) : t('na')}
                        {'  →  '}
                        {day.stopData ? formatDate(day.stopData.date, lang) : t('na')}
                    </ThemedText>
                    {day.startData &&
                        <Row label={t('start')} value={`${formatSimplePlace(day.startData.place, day.startData.placeData)} · ${formatOdometer(day.startData.odometer)}`} />}
                    {day.stopData &&
                        <Row label={t('stop')} value={`${formatSimplePlace(day.stopData.place, day.stopData.placeData)} · ${formatOdometer(day.stopData.odometer)}`} />}
                    <Row label={t('driveTime')} value={formatTimeToTime(day.driveTime)} />
                    {day.doubleCrew && <Row label={t('secondDriver')} value={formatTimeToTime(day.driveTime2)} />}
                    <Row label={t('workTime')} value={formatTimeToTime(day.workTime)} />
                    {day.cardState === dayCardStateEnum.notUsed && <Row label={t('breakTime')} value={formatTimeToTime(day.breakTime)} />}
                    <Row label={t('distance')} value={formatOdometer(day.distance)} />
                    <Row label={t('fuel')} value={formatFuelQuantity(day.fuelBurned, 'oneDecimal')} />
                    {(!!day.startData?.notes || !!day.stopData?.notes) &&
                        <ThemedText style={{ opacity: 0.75, marginTop: 2 }}>
                            {t('notes')}: {[day.startData?.notes, day.stopData?.notes].filter(Boolean).join(' | ')}
                        </ThemedText>}
                </View>
            )}
        />
    );
}
