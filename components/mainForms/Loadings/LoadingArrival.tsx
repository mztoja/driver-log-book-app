import React from "react";
import { AddLogData, GeneralFormData } from "@/types";
import { MainFormModal } from "../MainFormModal";
import { ScrollView } from "react-native";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { SendButton } from "@/components/buttons/SendButton";
import { useApi } from "@/hooks/useApi";
import { useGlobalState } from "@/hooks/useGlobalState";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useSnackbar } from "@/hooks/useSnackbar";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoadingArrival: React.FC<Props> = (props: Props): JSX.Element => {
    const { form, setForm, visible, setVisible } = props;
    const { showSnackbar } = useSnackbar();
    const { fetchData, loading } = useApi();
    const { user } = useGlobalState();
    const txt = {
        title: getText('home', 'loadingArrival'),
        action: getText('home', 'loadingArrivalAction'),
        success: getText('home', 'loadingArrivalSuccess'),
    };

    React.useEffect(() => {
        if (visible) {
            if (user && user.markedDepart !== 0) {
                if (Number(form.placeId) !== user.markedDepart) {
                    setForm('place', '');
                    setForm('placeId', user.markedDepart.toString())
                }
            }
        }
    }, [visible]);

    const send = (): void => {
        const sendData: AddLogData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            action: txt.action,
        };

        fetchData(API_ENDPOINTS.LOADING_ARRIVAL, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.success, 'success');
                    props.setlastLogRefresh((prev) => !prev);
                    props.setVisible(false);
                }
            });
    }

    return (
        <MainFormModal
            visible={visible}
            setVisible={setVisible}
            title={txt.title}
        >
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
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
}