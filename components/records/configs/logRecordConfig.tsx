import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { LangInterface, LogInterface, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatOdometer } from '@/utils/formats/formatOdometer';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { formatCountry } from '@/utils/formats/formatCountry';
import { RecordConfig, RecordEditProps } from '@/components/records/RecordList';
import { LogEditDispatcher } from '@/components/records/edit/LogEditDispatcher';

const LogEdit: React.FC<RecordEditProps<LogInterface>> = ({ item, onClose, onSaved }) => (
    <LogEditDispatcher log={item} onClose={onClose} onSaved={onSaved} />
);

export const logRecordConfig = (lang: LangInterface): RecordConfig<LogInterface> => {
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    return {
        endpoints: {
            tour: API_ENDPOINTS.getLogsByTourId,
            place: API_ENDPOINTS.getLogsByPlaceId,
            all: API_ENDPOINTS.getLogs,
        },
        searchable: true,
        emptyText: t('noRecords'),
        renderSummary: (log) => (
            <View style={{ gap: 3 }}>
                <ThemedText type="defaultSemiBold">{log.action}</ThemedText>
                <ThemedText style={{ fontSize: 13, opacity: 0.85 }}>{formatDate(log.date, lang)}</ThemedText>
                <ThemedText style={{ opacity: 0.9 }}>
                    {[formatCountry(log.country, lang), formatSimplePlace(log.place, log.placeData)]
                        .filter(Boolean)
                        .join('  ·  ')}
                </ThemedText>
                <Row label={t('odometer')} value={formatOdometer(log.odometer)} />
            </View>
        ),
        renderDetails: (log) =>
            log.notes ? (
                <ThemedText style={{ opacity: 0.85 }}>
                    {t('notes')}: {log.notes}
                </ThemedText>
            ) : null,
        EditComponent: LogEdit,
    };
};
