import { DetachTrailerData, GeneralFormData, LoadInterface } from "@/types";
import { MainFormModal } from "../MainFormModal";
import { ScrollView } from "react-native";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { SendButton } from "@/components/buttons/SendButton";
import { useApi } from "@/hooks/useApi";
import { useSnackbar } from "@/hooks/useSnackbar";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useGlobalState } from "@/hooks/useGlobalState";
import ConfirmModal from "@/components/ConfirmModal";
import { useState } from "react";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveTourRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveLoadsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DetachTrailerForm: React.FC<Props> = (props: Props) => {

    const { form, setForm } = props;
    const { lang, setActiveLoads, activeTour } = useGlobalState();
    const [confirmVisible, setConfirmVisible] = useState<boolean>(false);
    const [confirmText, setConfirmText] = useState<string>('');
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'detachTrailer'),
        trailerNoValid: getText('home', 'trailerNoValid'),
        detachTrailerAction: getText('home', 'detachTrailerAction'),
        unloadingCompletedAction: getText('home', 'unloadingCompletedAction'),
    }

    const cancel = () => setConfirmVisible(false);

    const check = async (): Promise<void> => {

        // świeża lista z odpowiedzi – stan globalny zaktualizuje się dopiero po renderze
        const res = await fetchData<LoadInterface[]>(API_ENDPOINTS.GET_NOT_UNLOADED_LOADS, { setData: setActiveLoads });
        const loadsOnTrailer = (res.responseData ?? []).filter(
            load => load.vehicle === activeTour?.trailer
        );

        if (loadsOnTrailer.length > 0) {
            setConfirmText(getText('home', 'detachTrailerConfirm', lang, loadsOnTrailer.length.toString()));
            setConfirmVisible(true);
            return;
        }

        send();
    };


    const send = (): void => {
        setConfirmVisible(false);

        const sendData: DetachTrailerData = {
            date: props.form.date,
            country: props.form.country,
            place: props.form.place,
            placeId: props.form.placeId,
            odometer: props.form.odometer,
            notes: props.form.notes,
            action: txt.detachTrailerAction,
            unloadAction: txt.unloadingCompletedAction,
        };
        fetchData(API_ENDPOINTS.DETACH_TRAILER, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(getText('home', 'detachTrailerSuccess', lang), 'success');
                    props.setActiveTourRefresh((prev => !prev));
                    props.setActiveLoadsRefresh((prev => !prev));
                    props.setlastLogRefresh((prev => !prev));
                    props.setVisible(false);
                }
            });
    }

    return (

        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
            title={txt.title}
        >
            <ConfirmModal visible={confirmVisible} text={confirmText} onCancel={cancel} onConfirm={send} />
            <ScrollView style={STYLES.scrollView}>
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={check} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>

    );

};