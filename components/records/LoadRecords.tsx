import React, { useMemo } from 'react';
import { useGlobalState } from '@/hooks/useGlobalState';
import { RecordList, RecordSource } from '@/components/records/RecordList';
import { loadRecordConfig } from '@/components/records/configs/loadRecordConfig';

export const LoadRecords: React.FC<{ source: RecordSource }> = ({ source }) => {
    const { lang } = useGlobalState();
    const config = useMemo(() => loadRecordConfig(lang), [lang]);
    return <RecordList source={source} config={config} />;
};
