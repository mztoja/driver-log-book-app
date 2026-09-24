import React, { JSX, useState } from 'react';
import { ScrollView } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { AddVehicleFormInterface, VehicleInterface, vehicleTypeEnum, VehiclesInterface } from '@/types';
import { RegNumberInput } from '@/components/inputs/vehicles/RegNumberInput';
import { VehicleTypeSelect } from '@/components/inputs/vehicles/VehicleTypeSelect';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import { NotesInput } from '@/components/inputs/commons/NotesInput';
import { DateInput } from '@/components/inputs/commons/DateInput';
import { SendButton } from '@/components/buttons/SendButton';
import { NumberField, TextField } from '@/components/records/edit/fields';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
    // null / undefined -> dodawanie; obiekt -> edycja (ciężarówki albo naczepy wg vehicle.type)
    vehicle?: VehicleInterface | null;
    // dodawanie: wstępny typ i numer (np. nieznany pojazd kliknięty w panelu Info)
    initialType?: vehicleTypeEnum;
    initialRegistration?: string;
}

const year = new Date().getFullYear();

const formFromVehicle = (v: VehicleInterface): AddVehicleFormInterface => ({
    type: v.type,
    registrationNr: v.registrationNr ?? '',
    model: v.model ?? '',
    isLoadable: v.isLoadable ? 'true' : 'false',
    weight: v.weight ? v.weight.toString() : '',
    year: v.year ? v.year.toString() : '',
    fuel: v.fuel ? v.fuel.toString() : '0',
    techRev: v.techRev ?? '',
    insurance: v.insurance ?? '',
    tacho: v.tacho ?? '',
    service: v.service ? v.service.toString() : '',
    notes: v.notes ?? '',
});

/**
 * Odpowiednik front `AddVehicle` + `TruckEdit` + `TrailerEdit`: te same pola i te same zasady
 * (pola ciężarówki: ładowalność, bak, tachograf, serwis – tylko dla ciężarówki).
 */
export const VehicleFormModal: React.FC<Props> = (props: Props): JSX.Element => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const t = (k: keyof VehiclesInterface['en']) => getText('vehicles', k, lang);

    const isEdit = !!props.vehicle;
    // rodzic montuje komponent z kluczem zależnym od edytowanego pojazdu
    const [original] = useState<AddVehicleFormInterface | null>(props.vehicle ? formFromVehicle(props.vehicle) : null);
    const [form, setForm] = useState<AddVehicleFormInterface>(
        props.vehicle
            ? formFromVehicle(props.vehicle)
            : {
                type: props.initialType ?? vehicleTypeEnum.trailer,
                registrationNr: props.initialRegistration ?? '',
                model: '',
                isLoadable: 'false',
                weight: '',
                year: '',
                fuel: '',
                techRev: `${year}-01-01`,
                insurance: `${year}-01-01`,
                tacho: `${year}-01-01`,
                service: '',
                notes: '',
            },
    );

    const update = (key: keyof AddVehicleFormInterface, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: key === 'type' ? Number(value) : value }));
    };

    const isTruck = Number(form.type) === vehicleTypeEnum.truck;

    const send = (): void => {
        if (isEdit && original && JSON.stringify(original) === JSON.stringify(form)) {
            showSnackbar(t('noChanges'), 'info');
            return;
        }
        let request;
        if (!isEdit) {
            request = fetchData(API_ENDPOINTS.createVehicle, { method: 'POST', sendData: form }, { showSnackbar });
        } else if (isTruck) {
            const { type: _type, ...truckForm } = form;
            request = fetchData(`${API_ENDPOINTS.editTruck}/${props.vehicle!.id}`, { method: 'PATCH', sendData: truckForm }, { showSnackbar });
        } else {
            const trailerForm = {
                registrationNr: form.registrationNr,
                model: form.model,
                weight: form.weight,
                year: form.year,
                techRev: form.techRev,
                insurance: form.insurance,
                notes: form.notes,
            };
            request = fetchData(`${API_ENDPOINTS.editTrailer}/${props.vehicle!.id}`, { method: 'PATCH', sendData: trailerForm }, { showSnackbar });
        }
        request.then((res) => {
            if (res.success) {
                showSnackbar(isEdit ? t('editSuccessInfo') : t('addSuccess'), 'success');
                props.onClose();
                props.onSaved();
            }
        });
    };

    const title = isEdit ? getText('vehicles', 'editHeader', lang, props.vehicle!.registrationNr) : t('addVehicle');

    return (
        <MainFormModal visible={props.visible} setVisible={() => props.onClose()} title={title}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                {!isEdit && (
                    <VehicleTypeSelect value={form.type.toString()} onChange={(e) => update('type', e)} />
                )}
                <RegNumberInput
                    value={form.registrationNr}
                    vehicle={isTruck ? 'truck' : 'trailer'}
                    onChange={(e) => update('registrationNr', e)}
                />
                <TextField label={t('model')} value={form.model} onChange={(e) => update('model', e)} />
                <NumberField label={t('yearOfProduction')} value={form.year} onChange={(e) => update('year', e.slice(0, 4))} />
                <NumberField label={`${t('weight')} (kg)`} value={form.weight} onChange={(e) => update('weight', e)} />
                {isTruck && (
                    <>
                        <OnOffSwitch label={t('isLoadable')} value={form.isLoadable} onChange={(e) => update('isLoadable', e)} />
                        <NumberField label={`${t('tankCapacity')} (L)`} value={form.fuel} onChange={(e) => update('fuel', e)} />
                    </>
                )}
                <DateInput label={t('insurance')} value={form.insurance} onChange={(e) => update('insurance', e)} />
                <DateInput label={t('techRev')} value={form.techRev} onChange={(e) => update('techRev', e)} />
                {isTruck && (
                    <>
                        <DateInput label={t('tacho')} value={form.tacho} onChange={(e) => update('tacho', e)} />
                        <NumberField label={`${t('nextService')} (km)`} value={form.service} onChange={(e) => update('service', e)} />
                    </>
                )}
                <NotesInput value={form.notes} onChange={(e) => update('notes', e)} />
                <SendButton onPress={send} text={isEdit ? t('edit') : t('addVehicle')} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
