import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { DayEditData, DayInterface, LogEditData, dayCardStateEnum, dayStatusEnum } from '@/types';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import { SendButton } from '@/components/buttons/SendButton';
import { LogFieldset, NumberField, TimeField, MoreFieldsToggle } from './fields';

interface Props {
    day: DayInterface | null;
    onClose: () => void;
    onSaved: () => void;
}

const logForm = (log: DayInterface['startData']): LogEditData => ({
    id: 0,
    date: log?.date ?? '',
    action: log?.action ?? '',
    country: log?.country ?? '',
    place: log?.place ?? '',
    placeId: log?.placeId ? log.placeId.toString() : '0',
    odometer: log?.odometer ? log.odometer.toString() : '0',
    notes: log?.notes ?? '',
});

const formFromDay = (day: DayInterface): DayEditData => ({
    id: day.id,
    startData: { ...logForm(day.startData), id: day.startLogId },
    stopData: { ...logForm(day.stopData ?? undefined), id: day.stopLogId },
    cardState: day.cardState ?? dayCardStateEnum.notUsed,
    distance: day.distance ? day.distance.toString() : '0',
    driveTime: day.driveTime ?? '',
    driveTime2: day.driveTime2 ?? '',
    workTime: day.workTime ?? '',
    breakTime: day.breakTime ?? '',
    fuelBurned: day.fuelBurned ? day.fuelBurned.toString() : '0',
    doubleCrew: day.doubleCrew ? 'true' : 'false',
});

export const DayEditModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState<DayEditData>(
        props.day ? formFromDay(props.day) : formFromDay({ id: 0 } as DayInterface),
    );
    const [more, setMore] = useState<boolean>(false);

    const update = (key: keyof DayEditData, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const updateLog = (part: 'startData' | 'stopData', key: keyof LogEditData, value: string): void => {
        setForm((prev) => ({ ...prev, [part]: { ...prev[part], [key]: value } }));
    };

    if (!props.day) return null;

    const finished = props.day.status === dayStatusEnum.finished;

    const send = (): void => {
        const endpoint = finished ? API_ENDPOINTS.editDay : API_ENDPOINTS.editSimpleDay;
        fetchData<DayInterface>(endpoint, { method: 'PATCH', sendData: { ...form, id: props.day!.id } }, { showSnackbar }).then(
            (res) => {
                if (res.success) {
                    showSnackbar(getText('tours', 'editSuccess', lang), 'success');
                    props.onSaved();
                }
            },
        );
    };

    return (
        <MainFormModal visible setVisible={() => props.onClose()} title={getText('tours', 'dayEditHeader', lang)}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                <LogFieldset
                    title={getText('tours', 'sectionStart', lang)}
                    value={form.startData}
                    onChange={(k, v) => updateLog('startData', k, v)}
                    showActivity
                />
                <NumberField label={getText('tours', 'distance', lang)} value={form.distance} onChange={(e) => update('distance', e)} />

                <MoreFieldsToggle expanded={more} onToggle={() => setMore((p) => !p)} />

                {more && (
                    <>
                        {finished && (
                            <LogFieldset
                                title={getText('tours', 'sectionStop', lang)}
                                value={form.stopData}
                                onChange={(k, v) => updateLog('stopData', k, v)}
                                showActivity
                            />
                        )}
                        <OnOffSwitch
                            label={getText('common', 'doubleCrew', lang)}
                            value={form.doubleCrew}
                            onChange={(e) => update('doubleCrew', e)}
                        />
                        <TimeField label={getText('tours', 'driveTime', lang)} value={form.driveTime} onChange={(e) => update('driveTime', e)} />
                        {form.doubleCrew === 'true' && (
                            <TimeField
                                label={getText('tours', 'secondDriver', lang)}
                                value={form.driveTime2}
                                onChange={(e) => update('driveTime2', e)}
                            />
                        )}
                        <TimeField label={getText('tours', 'workTime', lang)} value={form.workTime} onChange={(e) => update('workTime', e)} />
                        <TimeField label={getText('tours', 'breakTime', lang)} value={form.breakTime} onChange={(e) => update('breakTime', e)} />
                        <NumberField
                            label={getText('tours', 'fuel', lang)}
                            value={form.fuelBurned}
                            onChange={(e) => update('fuelBurned', e)}
                            decimal
                        />
                    </>
                )}

                <SendButton onPress={send} text={getText('tours', 'editRecord', lang)} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
