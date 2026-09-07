import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { useApi } from '@/hooks/useApi';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { AddPlaceFormInterface, PlaceInterface, placeTypeEnum } from '@/types';
import { CompanyNameInput } from '@/components/inputs/address/CompanyNameInput';
import { StreetInput } from '@/components/inputs/address/StreetInput';
import { PostCodeInput } from '@/components/inputs/address/PostCodeInput';
import { CityInput } from '@/components/inputs/address/CityInput';
import { CountrySelect } from '@/components/inputs/address/CountrySelect';
import { NotesInput } from '@/components/inputs/commons/NotesInput';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import { SendButton } from '@/components/buttons/SendButton';
import { PlaceTypeSelect } from '@/components/places/PlaceTypeSelect';
import { GpsInput } from '@/components/places/GpsInput';

interface Props {
    visible: boolean;
    onClose: () => void;
    // null / undefined -> tryb dodawania; obiekt -> tryb edycji
    place?: PlaceInterface | null;
    onSaved: () => void;
}

const emptyForm = (): AddPlaceFormInterface => ({
    isFavorite: 'false',
    type: placeTypeEnum.other.toString(),
    name: '',
    street: '',
    code: '',
    city: '',
    country: '',
    lat: '',
    lon: '',
    description: '',
    isMarked: 'false',
});

const formFromPlace = (p: PlaceInterface): AddPlaceFormInterface => ({
    isFavorite: p.isFavorite ? 'true' : 'false',
    type: p.type.toString(),
    name: p.name ?? '',
    street: p.street ?? '',
    code: p.code ?? '',
    city: p.city ?? '',
    country: p.country ?? '',
    lat: p.lat ? p.lat.toString() : '',
    lon: p.lon ? p.lon.toString() : '',
    description: p.description ?? '',
    isMarked: 'false',
});

export const PlaceFormModal: React.FC<Props> = (props: Props): JSX.Element => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const isEdit = !!props.place;
    // rodzic montuje ten komponent z kluczem zależnym od edytowanego miejsca
    const [form, setForm] = useState<AddPlaceFormInterface>(
        props.place ? formFromPlace(props.place) : emptyForm(),
    );

    const update = (key: keyof AddPlaceFormInterface, value: string): void => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const txt = {
        title: isEdit ? getText('places', 'editPlace', lang) : getText('places', 'addPlace', lang),
        submit: isEdit ? getText('places', 'submitEdit', lang) : getText('places', 'submitAdd', lang),
    };

    const send = (): void => {
        if (form.name.trim().length < 1) {
            showSnackbar(getText('places', 'nameRequired', lang), 'warning');
            return;
        }
        if (form.city.trim().length < 1) {
            showSnackbar(getText('places', 'cityRequired', lang), 'warning');
            return;
        }
        if (form.country.trim().length < 1) {
            showSnackbar(getText('places', 'countryRequired', lang), 'warning');
            return;
        }
        if (form.name.length > 30) {
            showSnackbar(getText('common', 'companyNameHelper', lang), 'warning');
            return;
        }
        if (form.street.length > 50) {
            showSnackbar(getText('common', 'streetHelper', lang), 'warning');
            return;
        }
        if (form.code.length > 10) {
            showSnackbar(getText('common', 'codeHelper', lang), 'warning');
            return;
        }
        if (form.city.length > 30) {
            showSnackbar(getText('common', 'cityHelper', lang), 'warning');
            return;
        }

        const sendData = {
            ...form,
            lat: form.lat === '' ? '0' : form.lat,
            lon: form.lon === '' ? '0' : form.lon,
        };

        const request = isEdit
            ? fetchData(`${API_ENDPOINTS.editPlace}/${props.place!.id}`, { method: 'PATCH', sendData }, { showSnackbar })
            : fetchData(API_ENDPOINTS.createPlace, { method: 'POST', sendData }, { showSnackbar });

        request.then((res) => {
            if (res.success) {
                showSnackbar(isEdit ? getText('places', 'editSuccess', lang) : getText('places', 'addSuccess', lang), 'success');
                props.onClose();
                props.onSaved();
            }
        });
    };

    return (
        <MainFormModal visible={props.visible} setVisible={() => props.onClose()} title={txt.title}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={{ padding: 12 }}>
                <PlaceTypeSelect value={form.type} onChange={(e) => update('type', e)} />
                <CompanyNameInput value={form.name} onChange={(e) => update('name', e)} />
                <StreetInput value={form.street} onChange={(e) => update('street', e)} />
                <PostCodeInput value={form.code} onChange={(e) => update('code', e)} />
                <CityInput value={form.city} onChange={(e) => update('city', e)} />
                <CountrySelect value={form.country} onChange={(e) => update('country', e)} />
                <NotesInput value={form.description} onChange={(e) => update('description', e)} />
                <OnOffSwitch
                    label={getText('places', 'isFavorite', lang)}
                    value={form.isFavorite}
                    onChange={(e) => update('isFavorite', e)}
                />
                {!isEdit && (
                    <OnOffSwitch
                        label={getText('places', 'isDestination', lang)}
                        value={form.isMarked}
                        onChange={(e) => update('isMarked', e)}
                    />
                )}
                <GpsInput label={getText('places', 'lat', lang)} value={form.lat} onChange={(e) => update('lat', e)} />
                <GpsInput label={getText('places', 'lon', lang)} value={form.lon} onChange={(e) => update('lon', e)} />
                <SendButton onPress={send} text={txt.submit} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
