import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Row } from '@/components/tours/DetailCard';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { getText } from '@/utils/getText';
import { FinanceInterface, LangInterface, ToursInterface } from '@/types';
import { formatDate } from '@/utils/formats/formatDate';
import { formatAmount } from '@/utils/formats/formatAmount';
import { formatQuantity } from '@/utils/formats/formatQuantity';
import { RecordConfig, RecordEditProps } from '@/components/records/RecordList';
import { FinanceEditModal } from '@/components/records/edit/FinanceEditModal';

const FinanceEdit: React.FC<RecordEditProps<FinanceInterface>> = ({ item, onClose, onSaved }) => (
    <FinanceEditModal finance={item} onClose={onClose} onSaved={onSaved} />
);

export const financeRecordConfig = (lang: LangInterface): RecordConfig<FinanceInterface> => {
    const t = (k: keyof ToursInterface['en']) => getText('tours', k, lang);
    return {
        endpoints: { tour: API_ENDPOINTS.getFinancesByTourId, all: API_ENDPOINTS.getFinances },
        searchable: false,
        emptyText: t('noRecords'),
        renderSummary: (fin) => {
            const qty = Number(fin.quantity);
            const showUnit = qty > 1 && Number(fin.amount) !== 0;
            return (
                <View style={{ gap: 3 }}>
                    <ThemedText type="defaultSemiBold">{fin.itemDescription}</ThemedText>
                    {fin.logData && (
                        <ThemedText style={{ fontSize: 13, opacity: 0.85 }}>{formatDate(fin.logData.date, lang)}</ThemedText>
                    )}
                    <Row label={t('amount')} value={formatAmount(Number(fin.amount), fin.currency)} />
                    {showUnit && (
                        <Row
                            label={`${t('quantity')} / ${t('unitPrice')}`}
                            value={`${formatQuantity(qty)} · ${formatAmount(Number(fin.amount) / qty, fin.currency)}`}
                        />
                    )}
                    {fin.foreignCurrency !== '' && (
                        <Row label={t('foreignAmount')} value={formatAmount(Number(fin.foreignAmount), fin.foreignCurrency)} />
                    )}
                    <Row label={t('payment')} value={fin.payment} />
                </View>
            );
        },
        renderDetails: (fin) =>
            fin.logData?.notes ? (
                <ThemedText style={{ opacity: 0.85 }}>
                    {t('notes')}: {fin.logData.notes}
                </ThemedText>
            ) : null,
        EditComponent: FinanceEdit,
    };
};
