import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import { TourRecordList } from '@/components/tours/TourRecordList';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { FinanceInterface, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatQuantity } from '@/utils/formats/formatQuantity';

export default function TourFinancesScreen() {
    const { lang } = useGlobalState();
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);

    return (
        <TourRecordList
            endpoint={API_ENDPOINTS.getFinancesByTourId}
            renderItem={(fin: FinanceInterface) => {
                const qty = Number(fin.quantity);
                const showUnit = qty > 1 && Number(fin.amount) !== 0;
                return (
                    <View style={{ gap: 3 }}>
                        <ThemedText type="defaultSemiBold">{fin.itemDescription}</ThemedText>
                        {fin.logData && <ThemedText style={{ fontSize: 13, opacity: 0.85 }}>{formatDate(fin.logData.date, lang)}</ThemedText>}
                        <Row label={t('amount')} value={formatAmount(Number(fin.amount), fin.currency)} />
                        {showUnit &&
                            <Row label={`${t('quantity')} / ${t('unitPrice')}`} value={`${formatQuantity(qty)} · ${formatAmount(Number(fin.amount) / qty, fin.currency)}`} />}
                        {fin.foreignCurrency !== '' &&
                            <Row label={t('foreignAmount')} value={formatAmount(Number(fin.foreignAmount), fin.foreignCurrency)} />}
                        <Row label={t('payment')} value={fin.payment} />
                        {!!fin.logData?.notes && <ThemedText style={{ opacity: 0.75, marginTop: 2 }}>{t('notes')}: {fin.logData.notes}</ThemedText>}
                    </View>
                );
            }}
        />
    );
}
