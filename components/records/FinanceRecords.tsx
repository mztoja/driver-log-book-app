import React, { useMemo } from 'react';
import { useGlobalState } from '@/hooks/useGlobalState';
import { RecordList, RecordSource } from '@/components/records/RecordList';
import { financeRecordConfig } from '@/components/records/configs/financeRecordConfig';

export const FinanceRecords: React.FC<{ source: RecordSource }> = ({ source }) => {
    const { lang } = useGlobalState();
    const config = useMemo(() => financeRecordConfig(lang), [lang]);
    return <RecordList source={source} config={config} />;
};
