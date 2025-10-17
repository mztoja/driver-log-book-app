import { GeneralFormData, UnloadingData } from "@/types";
import { MainFormModal } from "../MainFormModal";
import { ScrollView } from "react-native";
import { STYLES } from "@/constants/STYLES";
import { getText } from "@/utils/getText";
import { DateTimeInput } from "@/components/inputs/commons/DateTimeInput";
import { OdometerInput } from "@/components/inputs/commons/OdometerInput";
import { LoadSelect } from "@/components/inputs/loads/LoadSelect";
import React from "react";
import { useGlobalState } from "@/hooks/useGlobalState";
import { OnOffSwitch } from "@/components/inputs/commons/OnOffSwitch";
import { PlaceInput } from "@/components/inputs/commons/PlaceInput";
import { NotesInput } from "@/components/inputs/commons/NotesInput";
import { SendButton } from "@/components/buttons/SendButton";
import { useApi } from "@/hooks/useApi";
import API_ENDPOINTS from "@/constants/API_ENDPOINTS";
import { useSnackbar } from "@/hooks/useSnackbar";

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveLoadsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const UnloadingCompleted: React.FC<Props> = (props: Props): JSX.Element => {

    const [switchValue, setSwitchValue] = React.useState<'false' | 'true'>('true');
    const [receiverKnown, setReceiverKnown] = React.useState<boolean>(false);
    const { form, setForm, visible, setVisible } = props;
    const { activeLoads, user } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'unloadingCompleted'),
        action: getText('home', 'unloadingCompletedAction'),
        success: getText('home', 'unloadingCompletedSuccess'),
        switchLabel: getText('home', 'unloadingLoadSelectLabel'),
    };

    React.useEffect(() => {
        const foundedLoad = activeLoads?.find((load) => load.id === Number(form.loadId));
        if (foundedLoad?.receiverData) {
            setForm('place', '');
            setForm('placeId', foundedLoad.receiverData.id.toString());
            setReceiverKnown(true);
            setSwitchValue('true');
        } else {
            setReceiverKnown(false);
            setSwitchValue('false');
        }
    }, [form.loadId]);

    const send = (): void => {
        if (!user) { return; }
        const sendData: UnloadingData = {
            date: form.date,
            country: switchValue === 'true' ? user.country : form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            action: txt.action,
            loadId: form.loadId,
            isPlaceAsReceiver: switchValue,
        };

        fetchData(API_ENDPOINTS.UNLOADING_LOAD, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.success, 'success');
                    props.setlastLogRefresh((prev) => !prev);
                    props.setVisible(false);
                    props.setActiveLoadsRefresh((prev) => !prev);
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
                <LoadSelect value={form.loadId} onChange={(e) => setForm('loadId', e)} />
                {receiverKnown &&
                    <OnOffSwitch
                        value={switchValue}
                        onChange={setSwitchValue}
                        label={txt.switchLabel}
                    />
                }
                {switchValue === 'false' && Number(form.loadId) > 0 &&
                    <PlaceInput
                        place={form.place}
                        placeId={form.placeId}
                        onChange={(e) => setForm('place', e)}
                        onChangeId={(e) => setForm('placeId', e)}
                        country={form.country}
                        onChangeCountry={(e) => setForm('country', e)}
                    />
                }
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
}