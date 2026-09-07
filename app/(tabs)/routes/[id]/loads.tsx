import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { TourRecordList } from '@/components/tours/TourRecordList';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { LoadInterface, loadStatusEnum, PlaceInterface, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatWeight } from '@/utils/formats/formatWeight';
import { formatSimplePlace } from '@/utils/formats/formatSimplePlace';
import { formatCountry } from '@/utils/formats/formatCountry';

export default function TourLoadsScreen() {
    const { lang } = useGlobalState();
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    const addr = (data: PlaceInterface | null | undefined) =>
        data ? `${formatSimplePlace('', data)} ${formatCountry(data.country, lang)}`.trim() : t('na');

    return (
        <TourRecordList
            endpoint={API_ENDPOINTS.getLoadingsByTourId}
            renderItem={(load: LoadInterface) => (
                <View style={{ gap: 3 }}>
                    <ThemedText type="defaultSemiBold">
                        {t('loadNr')} {load.loadNr}{load.description ? ` · ${load.description}` : ''}
                    </ThemedText>
                    {load.loadingLogData &&
                        <Row
                            label={t('loading')}
                            value={`${formatDate(load.loadingLogData.date, lang)} · ${formatSimplePlace(load.loadingLogData.place, load.loadingLogData.placeData)}`}
                        />}
                    <Row
                        label={t('unloading')}
                        value={load.status === loadStatusEnum.notUnloaded
                            ? t('notUnloaded')
                            : load.unloadingLogData
                                ? `${formatDate(load.unloadingLogData.date, lang)} · ${formatSimplePlace(load.unloadingLogData.place, load.unloadingLogData.placeData)}`
                                : t('na')}
                    />
                    <Row label={t('sender')} value={addr(load.senderData)} />
                    <Row label={t('receiver')} value={addr(load.receiverData)} />
                    <Row label={t('weight')} value={formatWeight(load.weight)} />
                    {load.quantity !== '' && <Row label={t('quantity')} value={load.quantity} />}
                    {load.reference !== '' && <Row label={t('reference')} value={load.reference} />}
                    {load.vehicle !== '' && <Row label={t('vehicle')} value={load.vehicle} />}
                </View>
            )}
        />
    );
}
