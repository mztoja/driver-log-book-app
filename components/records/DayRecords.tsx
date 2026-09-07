import React, { useMemo } from 'react';
import { useGlobalState } from '@/hooks/useGlobalState';
import { RecordList, RecordSource } from '@/components/records/RecordList';
import { dayRecordConfig } from '@/components/records/configs/dayRecordConfig';

export const DayRecords: React.FC<{ source: RecordSource }> = ({ source }) => {
    const { lang } = useGlobalState();
    const config = useMemo(() => dayRecordConfig(lang), [lang]);
    return <RecordList source={source} config={config} />;
};
