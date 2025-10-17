import { AddLogData, GeneralFormData } from "@/types";
import { MainFormModal } from "../MainFormModal";
import { ScrollView } from "react-native";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { SendButton } from "@/components/buttons/SendButton";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { useApi } from "@/hooks/useApi";
import { LoadSelect } from "@/components/inputs/loads/LoadSelect";
import React from "react";
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

export const UnloadingArrival: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm, visible, setVisible } = props;
    const { fetchData, loading } = useApi();
    const { activeLoads } = useGlobalState();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'unloadingArrival'),
        action: getText('home', 'unloadingArrivalAction'),
        success: getText('home', 'unloadingArrivalSuccess'),
        noLoadChosen: getText('dtcErrors', 'noLoadChosen'),
    };

    React.useEffect(() => {
        const foundedLoad = activeLoads?.find((load) => load.id === Number(form.loadId));
        if (foundedLoad?.receiverData) {
            setForm('place', '');
            setForm('placeId', foundedLoad.receiverData.id.toString());
        }
    }, [form.loadId]);

    const send = (): void => {
        if (Number(form.loadId) > 0) {
            const sendData: AddLogData = {
                date: form.date,
                country: form.country,
                place: form.place,
                placeId: form.placeId,
                odometer: form.odometer,
                notes: form.notes,
                action: txt.action,
            }
            fetchData(API_ENDPOINTS.UNLOADING_ARRIVAL, { method: 'POST', sendData }, { showSnackbar })
                .then((res) => {
                    if (res.success) {
                        showSnackbar(txt.success, 'success');
                        props.setlastLogRefresh((prev) => !prev);
                        props.setVisible(false);
                    }
                });
        } else {
            showSnackbar(txt.noLoadChosen, 'warning');
        }
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
                <LoadSelect value={form.loadId} onChange={(e) => setForm('loadId', e)} />
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