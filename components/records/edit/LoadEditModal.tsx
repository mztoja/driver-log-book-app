import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { LoadEditData, LoadInterface, LogEditData, loadStatusEnum } from '@/types';
import { LoadWeightInput } from '@/components/inputs/loads/LoadWeightInput';
import { LoadRefInput } from '@/components/inputs/loads/LoadRefInput';
import { LoadDescInput } from '@/components/inputs/loads/LoadDescInput';
import { LoadQuantityInput } from '@/components/inputs/loads/LoadQuantityInput';
import { SendButton } from '@/components/buttons/SendButton';
import { LogFieldset, NumberField, TextField, PlaceIdField, MoreFieldsToggle } from './fields';

interface Props {
    load: LoadInterface | null;
    onClose: () => void;
    onSaved: () => void;
}

const logForm = (log: LoadInterface['loadingLogData']): LogEditData => ({
    id: 0,
    date: log?.date ?? '',
    action: log?.action ?? '',
    country: log?.country ?? '',
    place: log?.place ?? '',
    placeId: log?.placeId ? log.placeId.toString() : '0',
    odometer: log?.odometer ? log.odometer.toString() : '0',
    notes: log?.notes ?? '',
});

const formFromLoad = (load: LoadInterface): LoadEditData => ({
    id: load.id,
    loadingLogData: { ...logForm(load.loadingLogData), id: load.loadingLogId },
    unloadingLogData: { ...logForm(load.unloadingLogData), id: load.unloadingLogId },
    vehicle: load.vehicle ?? '',
    senderId: load.senderId ? load.senderId.toString() : '0',
    receiverId: load.receiverId ? load.receiverId.toString() : '0',
    description: load.description ?? '',
    quantity: load.quantity ?? '',
    weight: load.weight ? load.weight.toString() : '',
    reference: load.reference ?? '',
    distance: load.distance ? load.distance.toString() : '0',
});

export const LoadEditModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const [form, setForm] = useState<LoadEditData>(
        props.load ? formFromLoad(props.load) : formFromLoad({ id: 0 } as LoadInterface),
    );
    const [more, setMore] = useState<boolean>(false);

    const update = (key: keyof LoadEditData, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };
    const updateLog = (part: 'loadingLogData' | 'unloadingLogData', key: keyof LogEditData, value: string): void => {
        setForm((prev) => ({ ...prev, [part]: { ...prev[part], [key]: value } }));
    };

    if (!props.load) return null;

    const unloaded = props.load.status === loadStatusEnum.unloaded;

    const send = (): void => {
        const endpoint = unloaded ? API_ENDPOINTS.editLoad : API_ENDPOINTS.editSimpleLoad;
        const sendData = {
            ...form,
            id: props.load!.id,
            loadingLogData: { ...form.loadingLogData, id: props.load!.loadingLogId },
            unloadingLogData: { ...form.unloadingLogData, id: props.load!.unloadingLogId },
        };
        fetchData<LoadInterface>(endpoint, { method: 'PATCH', sendData }, { showSnackbar }).then((res) => {
            if (res.success) {
                showSnackbar(getText('tours', 'editSuccess', lang), 'success');
                props.onSaved();
            }
        });
    };

    return (
        <MainFormModal visible setVisible={() => props.onClose()} title={getText('tours', 'loadEditHeader', lang)}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                <LogFieldset
                    title={getText('tours', 'sectionLoading', lang)}
                    value={form.loadingLogData}
                    onChange={(k, v) => updateLog('loadingLogData', k, v)}
                    showActivity
                />
                <LoadWeightInput value={form.weight} onChange={(e) => update('weight', e)} />
                <TextField label={getText('tours', 'vehicle', lang)} value={form.vehicle} onChange={(e) => update('vehicle', e)} />
                <LoadRefInput value={form.reference} onChange={(e) => update('reference', e)} />

                <MoreFieldsToggle expanded={more} onToggle={() => setMore((p) => !p)} />

                {more && (
                    <>
                        {unloaded && (
                            <LogFieldset
                                title={getText('tours', 'sectionUnloading', lang)}
                                value={form.unloadingLogData}
                                onChange={(k, v) => updateLog('unloadingLogData', k, v)}
                                showActivity
                            />
                        )}
                        <PlaceIdField
                            label={getText('tours', 'sender', lang)}
                            placeId={form.senderId}
                            onChange={(e) => update('senderId', e)}
                        />
                        <PlaceIdField
                            label={getText('tours', 'receiver', lang)}
                            placeId={form.receiverId}
                            onChange={(e) => update('receiverId', e)}
                        />
                        <LoadDescInput value={form.description} onChange={(e) => update('description', e)} />
                        <LoadQuantityInput value={form.quantity} onChange={(e) => update('quantity', e)} />
                        <NumberField
                            label={getText('tours', 'distance', lang)}
                            value={form.distance}
                            onChange={(e) => update('distance', e)}
                        />
                    </>
                )}

                <SendButton onPress={send} text={getText('tours', 'editRecord', lang)} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
