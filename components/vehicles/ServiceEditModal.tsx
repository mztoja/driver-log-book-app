import React, { JSX, useState } from 'react';
import { ScrollView } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { LogEditData, ServiceEditData, ServiceInterface, serviceTypeEnum } from '@/types';
import { ServiceTypeSelect } from '@/components/inputs/vehicles/ServiceTypeSelect';
import { ServiceEntryInput } from '@/components/inputs/vehicles/ServiceEntryInput';
import { SendButton } from '@/components/buttons/SendButton';
import { LogFieldset } from '@/components/records/edit/fields';

interface Props {
    service: ServiceInterface;
    // licznik ma sens tylko dla ciężarówki (jak front ServiceEdit)
    isTruck: boolean;
    onClose: () => void;
    onSaved: () => void;
}

// odpowiednik front `serviceDefaultValues`
const formFromService = (s: ServiceInterface): ServiceEditData => ({
    id: 0,
    logData: {
        id: 0,
        date: s.logData?.date ?? '',
        action: s.logData?.action ?? '',
        country: s.logData?.country ?? '',
        place: s.logData?.place ?? '',
        placeId: s.logData?.placeId ? s.logData.placeId.toString() : '',
        odometer: s.logData?.odometer ? s.logData.odometer.toString() : '0',
        notes: s.logData?.notes ?? '',
    },
    type: s.type ?? serviceTypeEnum.maintenance,
    entry: s.entry ?? '',
});

/** Odpowiednik front `ServiceEdit`: pola czynności (log) + rodzaj i opis serwisu. */
export const ServiceEditModal: React.FC<Props> = (props: Props): JSX.Element => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const [original] = useState<ServiceEditData>(formFromService(props.service));
    const [form, setForm] = useState<ServiceEditData>(formFromService(props.service));

    const updateLog = (key: keyof LogEditData, value: string): void => {
        setForm((prev) => ({ ...prev, logData: { ...prev.logData, [key]: value } }));
    };

    const send = (): void => {
        if (JSON.stringify(original) === JSON.stringify(form)) {
            showSnackbar(getText('vehicles', 'noChanges', lang), 'info');
            return;
        }
        fetchData<ServiceInterface>(API_ENDPOINTS.editService, {
            method: 'PATCH',
            sendData: {
                ...form,
                id: props.service.id,
                logData: { ...form.logData, id: props.service.logId },
            },
        }, { showSnackbar }).then((res) => {
            if (res.success) {
                showSnackbar(getText('vehicles', 'editServiceSuccess', lang), 'success');
                props.onClose();
                props.onSaved();
            }
        });
    };

    return (
        <MainFormModal visible setVisible={() => props.onClose()} title={getText('vehicles', 'editServiceHeader', lang)}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                <LogFieldset
                    title={getText('vehicles', 'editLogLegend', lang)}
                    value={form.logData}
                    onChange={updateLog}
                    showActivity
                    hideOdometer={!props.isTruck}
                />
                <ServiceTypeSelect
                    value={form.type.toString()}
                    onChange={(e) => setForm((prev) => ({ ...prev, type: Number(e) as serviceTypeEnum }))}
                />
                <ServiceEntryInput value={form.entry} onChange={(e) => setForm((prev) => ({ ...prev, entry: e }))} />
                <SendButton onPress={send} text={getText('vehicles', 'edit', lang)} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
