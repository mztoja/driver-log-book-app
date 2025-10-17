import React from 'react';
import { AddLoadingData, GeneralFormData } from "@/types";
import { MainFormModal } from '../MainFormModal';
import { ScrollView, View } from 'react-native';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';
import { DateTimeInput } from '@/components/inputs/commons/DateTimeInput';
import { OdometerInput } from '@/components/inputs/commons/OdometerInput';
import { PlaceInput } from '@/components/inputs/commons/PlaceInput';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import { NotesInput } from '@/components/inputs/commons/NotesInput';
import { SendButton } from '@/components/buttons/SendButton';
import { useApi } from '@/hooks/useApi';
import { ThemedText } from '@/components/ThemedText';
import { useGlobalState } from '@/hooks/useGlobalState';
import { LoadOnVehicleSelect } from '@/components/inputs/loads/LoadOnVehicleSelect';
import { LoadRefInput } from '@/components/inputs/loads/LoadRefInput';
import { LoadDescInput } from '@/components/inputs/loads/LoadDescInput';
import { LoadWeightInput } from '@/components/inputs/loads/LoadWeightInput';
import { LoadQuantityInput } from '@/components/inputs/loads/LoadQuantityInput';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useSnackbar } from '@/hooks/useSnackbar';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveLoadsRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoadingCompleted: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm, visible, setVisible } = props;
    const { user, activeTour } = useGlobalState();
    const [switchValue, setSwitchValue] = React.useState<'false' | 'true'>('true');
    const [senderCountry, setSenderCountry] = React.useState<string>(form.country);
    const [receiverCountry, setReceiverCountry] = React.useState<string>(form.country);
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'loadingCompleted'),
        action: getText('home', 'loadingCompletedAction'),
        success: getText('home', 'loadingCompletedSuccess'),
        senderSwitchLabel: getText('home', 'loadingSenderSwitchLabel'),
        loadingPlace: getText('home', 'loadingPlace'),
        sender: getText('home', 'loadingSender'),
        receiver: getText('home', 'loadingReceiver'),
    };

    React.useEffect(() => {
        if (user && user.markedArrive !== 0) {
            setForm('senderId', user.markedArrive.toString());
            setForm('place', '');
            setForm('placeId', user.markedArrive.toString());
        } else {
            setForm('senderId', form.placeId);
        }
    }, []);

    const send = (): void => {
        const sendData: AddLoadingData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            action: txt.action,
            vehicle: form.vehicle,
            senderId: form.senderId,
            receiverId: form.receiverId,
            weight: form.weight,
            quantity: form.quantity,
            reference: form.reference,
            description: form.description,
        };

        fetchData(API_ENDPOINTS.CREATE_LOAD, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.success, 'success');
                    props.setlastLogRefresh((prev) => !prev);
                    props.setVisible(false);
                    setForm('notes', '');
                    setForm('quantity', '');
                    setForm('reference', '');
                    setForm('description', '');
                    setForm('weight', '');
                    props.setActiveLoadsRefresh((prev) => !prev);
                }
            });
    };

    return (
        <MainFormModal
            visible={visible}
            setVisible={setVisible}
            title={txt.title}
        >
            <ScrollView style={STYLES.scrollView}>
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                <View style={STYLES.separator} />
                <ThemedText style={{ alignSelf: 'center' }}>{txt.sender}</ThemedText>
                <PlaceInput
                    place=''
                    placeId={form.senderId}
                    onChange={() => { }}
                    onChangeId={(e) => setForm('senderId', e)}
                    country={senderCountry}
                    onChangeCountry={(e) => { setSenderCountry(e) }}
                    options={{
                        label: txt.sender,
                        disablePlaceText: true,
                    }}
                />
                <View style={STYLES.separator} />
                <ThemedText style={{ alignSelf: 'center' }}>{txt.loadingPlace}</ThemedText>
                <OnOffSwitch
                    value={switchValue}
                    onChange={setSwitchValue}
                    label={txt.senderSwitchLabel}
                />
                {switchValue === 'false' &&
                    <PlaceInput
                        place={form.place}
                        placeId={form.placeId}
                        onChange={(e) => setForm('place', e)}
                        onChangeId={(e) => setForm('placeId', e)}
                        country={form.country}
                        onChangeCountry={(e) => setForm('country', e)}
                        options={{
                            label: txt.loadingPlace,
                        }}
                    />
                }
                <View style={STYLES.separator} />
                <ThemedText style={{ alignSelf: 'center' }}>{txt.receiver}</ThemedText>
                <PlaceInput
                    place=''
                    placeId={form.receiverId}
                    onChange={() => { }}
                    onChangeId={(e) => setForm('receiverId', e)}
                    country={receiverCountry}
                    onChangeCountry={(e) => { setReceiverCountry(e) }}
                    options={{
                        label: txt.receiver,
                        disablePlaceText: true,
                    }}
                />
                <View style={STYLES.separator} />
                <LoadOnVehicleSelect
                    value={form.vehicle}
                    onChange={(e) => setForm('vehicle', e)}
                    truck={activeTour ? activeTour.truck : ''}
                    trailer={activeTour ? activeTour.trailer : null}
                />
                <LoadRefInput value={form.reference} onChange={(e) => setForm('reference', e)} />
                <LoadDescInput value={form.description} onChange={(e) => setForm('description', e)} />
                <LoadWeightInput value={form.weight} onChange={(e) => setForm('weight', e)} />
                <LoadQuantityInput value={form.quantity} onChange={(e) => setForm('quantity', e)} />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
}