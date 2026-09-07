import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { TourRecordList } from '@/components/tours/TourRecordList';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { LogInterface, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { formatCountry } from '@/utils/formats/formatCountry';

export default function TourLogsScreen() {
    const { lang } = useGlobalState();
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);

    return (
        <TourRecordList
            endpoint={API_ENDPOINTS.getLogsByTourId}
            renderItem={(log: LogInterface) => (
                <View style={{ gap: 3 }}>
                    <ThemedText type="defaultSemiBold">{log.action}</ThemedText>
                    <ThemedText style={{ fontSize: 13, opacity: 0.85 }}>{formatDate(log.date, lang)}</ThemedText>
                    <ThemedText style={{ opacity: 0.9 }}>
                        {[formatCountry(log.country, lang), formatSimplePlace(log.place, log.placeData)].filter(Boolean).join(' · ')}
                    </ThemedText>
                    <Row label={t('odometer')} value={formatOdometer(log.odometer)} />
                    {!!log.notes && <ThemedText style={{ opacity: 0.75, marginTop: 2 }}>{t('notes')}: {log.notes}</ThemedText>}
                </View>
            )}
        />
    );
}
