import { AddLogData, GeneralFormData } from "@/types";
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
import { RegNumberInput } from "@/components/inputs/vehicles/RegNumberInput";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useGlobalState } from "@/hooks/useGlobalState";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveTourRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AttachTrailerForm: React.FC<Props> = (props: Props) => {

    const { form, setForm } = props;
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'attachTrailer'),
        trailerNoValid: getText('home', 'trailerNoValid'),
        attatchTrailerAction: getText('home', 'attachTrailerAction'),
    }

    const send = (): void => {
        if (form.trailer.length <= 3) {
            showSnackbar(txt.trailerNoValid, 'warning');
        } else {
            setForm('trailer', form.trailer.replace(/\s/g, ''));
            const sendData: AddLogData = {
                date: props.form.date,
                country: props.form.country,
                place: props.form.place,
                placeId: props.form.placeId,
                odometer: props.form.odometer,
                notes: props.form.notes,
                action: txt.attatchTrailerAction + ': ' + form.trailer,
            };
            fetchData(API_ENDPOINTS.ATTACH_TRAILER, { method: 'POST', sendData }, { showSnackbar })
                .then((res) => {
                    if (res.success) {
                        showSnackbar(getText('home', 'attachTrailerSuccess', lang, form.action), 'success');
                        props.setActiveTourRefresh((prev => !prev));
                        props.setlastLogRefresh((prev => !prev));
                        props.setVisible(false);
                    }
                });
        }
    }

    return (
        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
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
                <RegNumberInput value={form.trailer} vehicle="trailer" onChange={(e) => setForm('trailer', e)} />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );

};