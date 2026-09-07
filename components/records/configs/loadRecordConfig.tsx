import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { LangInterface, LoadInterface, PlaceInterface, ToursInterface, loadStatusEnum } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { formatCountry } from '@/utils/formats/formatCountry';
import { RecordConfig, RecordEditProps } from '@/components/records/RecordList';
import { LoadEditModal } from '@/components/records/edit/LoadEditModal';

const LoadEdit: React.FC<RecordEditProps<LoadInterface>> = ({ item, onClose, onSaved }) => (
    <LoadEditModal load={item} onClose={onClose} onSaved={onSaved} />
);

export const loadRecordConfig = (lang: LangInterface): RecordConfig<LoadInterface> => {
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    const addr = (data: PlaceInterface | null | undefined): string =>
        data ? `${formatSimplePlace('', data)} ${formatCountry(data.country, lang)}`.trim() : t('na');
    return {
        endpoints: { tour: API_ENDPOINTS.getLoadingsByTourId, all: API_ENDPOINTS.getLoadings },
        searchable: false,
        emptyText: t('noRecords'),
        renderSummary: (load) => (
            <View style={{ gap: 3 }}>
                <ThemedText type="defaultSemiBold">
                    {t('loadNr')} {load.loadNr}
                    {load.description ? ` · ${load.description}` : ''}
                </ThemedText>
                {load.loadingLogData && (
                    <Row
                        label={t('loading')}
                        value={`${formatDate(load.loadingLogData.date, lang)} · ${formatSimplePlace(load.loadingLogData.place, load.loadingLogData.placeData)}`}
                    />
                )}
                <Row
                    label={t('unloading')}
                    value={
                        load.status === loadStatusEnum.notUnloaded
                            ? t('notUnloaded')
                            : load.unloadingLogData
                              ? `${formatDate(load.unloadingLogData.date, lang)} · ${formatSimplePlace(load.unloadingLogData.place, load.unloadingLogData.placeData)}`
                              : t('na')
                    }
                />
                <Row label={t('sender')} value={addr(load.senderData)} />
                <Row label={t('receiver')} value={addr(load.receiverData)} />
                <Row label={t('weight')} value={formatWeight(load.weight)} />
                {load.quantity !== '' && <Row label={t('quantity')} value={load.quantity} />}
                {load.reference !== '' && <Row label={t('reference')} value={load.reference} />}
                {load.vehicle !== '' && <Row label={t('vehicle')} value={load.vehicle} />}
            </View>
        ),
        EditComponent: LoadEdit,
    };
};
