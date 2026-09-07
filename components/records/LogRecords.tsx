import React, { useMemo } from 'react';
import { useGlobalState } from '@/hooks/useGlobalState';
import { RecordList, RecordSource } from '@/components/records/RecordList';
import { logRecordConfig } from '@/components/records/configs/logRecordConfig';

export const LogRecords: React.FC<{ source: RecordSource }> = ({ source }) => {
    const { lang } = useGlobalState();
    const config = useMemo(() => logRecordConfig(lang), [lang]);
    return <RecordList source={source} config={config} />;
};
