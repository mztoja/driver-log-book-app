import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { HelperText } from "react-native-paper";
import { MainFormModal } from "../MainFormModal";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { GeneralFormData, LoadInterface, LogInterface, StopTourData, TourInterface } from "@/types";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useApi } from "@/hooks/useApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useGlobalState } from "@/hooks/useGlobalState";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { FuelInput } from "@/components/inputs/commons/FuelInput";
import { SendButton } from "@/components/buttons/SendButton";
import ConfirmModal from "@/components/ConfirmModal";
import { formatOdometer } from "@/utils/formats/formatOdometer";
import { formatFuelCombustion } from "@/utils/formats/formatFuelCombustion";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveTourRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveLoadsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const TourStopForm: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm } = props;
    const { lang, activeTour, setActiveTour } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();

    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [confirmText, setConfirmText] = useState<string>('');
    const [, setNotUnloaded] = useState<LoadInterface[] | null>(null);
    const [startOdometer, setStartOdometer] = useState<number | null>(null);

    const txt = {
        title: getText('home', 'tourStop', lang),
        finishedTourAction: getText('home', 'finishedTourAction', lang),
        finishedTour: getText('home', 'finishedTour', lang),
        unloadNote: getText('home', 'finishTourUnloadNote', lang),
        unloadAction: getText('home', 'unloadingCompletedAction', lang),
        helper: getText('home', 'tourStopHelper1', lang),
    };

    // formularz jest zamontowany na stałe na home – stan paliwa (uwzględniający tankowania z bieżącej
    // sesji) i licznik startu trasy liczymy przy każdym otwarciu
    useEffect(() => {
        if (!props.visible) return;
        setStartOdometer(null);
        (async () => {
            // świeża trasa – tankowania dodane w tej sesji nie odświeżają activeTour w stanie globalnym
            const tourRes = await fetchData<TourInterface>(API_ENDPOINTS.GET_ACTIVE_ROUTE, { setData: setActiveTour });
            const tour = tourRes.responseData;
            if (!tour) return;
            const proposed = (Number(tour.fuelStateBefore) + Number(tour.totalRefuel)) - Number(tour.burnedFuelComp);
            setForm('fuelQuantity', proposed.toFixed(0));
            const logRes = await fetchData<LogInterface>(`${API_ENDPOINTS.getLogById}/${tour.startLogId}`);
            if (logRes.responseData) setStartOdometer(logRes.responseData.odometer);
        })();
        // eslint-disable-next-line
    }, [props.visible]);

    const distance = startOdometer !== null ? Number(form.odometer) - startOdometer : null;
    const burnedFuel = activeTour
        ? Number(activeTour.fuelStateBefore) - Number(form.fuelQuantity) + Number(activeTour.totalRefuel)
        : 0;

    const submit = (): void => {
        fetchData<LoadInterface[]>(API_ENDPOINTS.GET_NOT_UNLOADED_LOADS, { setData: setNotUnloaded })
            .then((res) => {
                const loads = res.responseData ?? [];
                if (loads.length > 0) {
                    setConfirmText(getText('home', 'finishTourUnloadedLoadsConfirm', lang, loads.length.toString()));
                    setConfirmVisible(true);
                } else {
                    send();
                }
            });
    };

    const send = (): void => {
        setConfirmVisible(false);
        const sendData: StopTourData = {
            action: txt.finishedTourAction,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            date: form.date,
            fuelStateAfter: form.fuelQuantity,
            unloadNote: txt.unloadNote,
            unloadAction: txt.unloadAction,
        };
        fetchData(API_ENDPOINTS.finishRoute, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.finishedTour, 'success');
                    setActiveTour(null);
                    props.setlastLogRefresh((prev) => !prev);
                    props.setActiveTourRefresh((prev) => !prev);
                    props.setActiveLoadsRefresh((prev) => !prev);
                    setForm('notes', '');
                    props.setVisible(false);
                }
            });
    };

    return (
        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
            title={txt.title}
        >
            <ScrollView style={STYLES.scrollView}>
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <FuelInput value={form.fuelQuantity} onChange={(e) => setForm('fuelQuantity', e)} type="quantity" />
                <HelperText type="info">{txt.helper}</HelperText>
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                {distance !== null &&
                    <HelperText type="info">
                        {getText('home', 'tourStopHelperDistance', lang, formatOdometer(distance))}
                        {' '}
                        {getText('home', 'tourStopHelperCombustion', lang, formatFuelCombustion(burnedFuel, distance))}
                    </HelperText>
                }
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={submit} text={txt.title} loading={loading} />
            </ScrollView>
            <ConfirmModal
                visible={confirmVisible}
                text={confirmText}
                onConfirm={send}
                onCancel={() => setConfirmVisible(false)}
            />
        </MainFormModal>
    );
};
