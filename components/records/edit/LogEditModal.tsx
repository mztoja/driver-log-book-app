import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { LogEditData, LogInterface } from '@/types';
import { DateTimeInput } from '@/components/inputs/commons/DateTimeInput';
import { OdometerInput } from '@/components/inputs/commons/OdometerInput';
import { PlaceInput } from '@/components/inputs/commons/PlaceInput';
import { ActivityInput } from '@/components/inputs/commons/ActivityInput';
import { NotesInput } from '@/components/inputs/commons/NotesInput';
import { SendButton } from '@/components/buttons/SendButton';

interface Props {
    log: LogInterface | null;
    onClose: () => void;
    onSaved: () => void;
}

const formFromLog = (log: LogInterface): LogEditData => ({
    id: log.id,
    date: log.date ?? '',
    action: log.action ?? '',
    country: log.country ?? '',
    place: log.place ?? '',
    placeId: log.placeId ? log.placeId.toString() : '0',
    odometer: log.odometer ? log.odometer.toString() : '0',
    notes: log.notes ?? '',
});

export const LogEditModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    // rodzic montuje ten komponent z kluczem = id logu, więc inicjalizacja stanu wystarcza
    const [form, setForm] = useState<LogEditData>(
        props.log ? formFromLog(props.log) : formFromLog({ id: 0 } as LogInterface),
    );

    const update = (key: keyof LogEditData, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    if (!props.log) return null;

    const send = (): void => {
        if (form.action.trim().length < 1) {
            showSnackbar(getText('dtcErrors', 'actionNoExist', lang), 'warning');
            return;
        }
        if (form.country.trim().length < 1) {
            showSnackbar(getText('dtcErrors', 'country', lang), 'warning');
            return;
        }
        fetchData<LogInterface>(
            API_ENDPOINTS.editLog,
            { method: 'PATCH', sendData: { ...form, id: props.log!.id } },
            { showSnackbar },
        ).then((res) => {
            if (res.success) {
                showSnackbar(getText('tours', 'editSuccess', lang), 'success');
                props.onSaved();
            }
        });
    };

    return (
        <MainFormModal visible setVisible={() => props.onClose()} title={getText('tours', 'logEditHeader', lang)}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                <DateTimeInput value={form.date} initialValue={props.log.date} onChange={(e) => update('date', e)} />
                <OdometerInput value={form.odometer} onChange={(e) => update('odometer', e)} disableHelper />
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => update('place', e)}
                    onChangeId={(e) => update('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => update('country', e)}
                />
                <ActivityInput value={form.action} onChange={(e) => update('action', e)} />
                <NotesInput value={form.notes} onChange={(e) => update('notes', e)} />
                <SendButton onPress={send} text={getText('tours', 'editRecord', lang)} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
