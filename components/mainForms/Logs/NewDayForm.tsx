import { STYLES } from '@/constants/STYLES';
import { ScrollView } from 'react-native';
import { getText } from '@/utils/getText';
import { GeneralFormData, StartDayData } from '@/types';
import { DateTimeInput } from '../../inputs/commons/DateTimeInput';
import { OdometerInput } from '../../inputs/commons/OdometerInput';
import { NotesInput } from '../../inputs/commons/NotesInput';
import { SendButton } from '../../buttons/SendButton';
import { useApi } from '@/hooks/useApi';
import { MainFormModal } from '../MainFormModal';
import { PlaceInput } from '@/components/inputs/commons/PlaceInput';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useSnackbar } from '@/hooks/useSnackbar';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveDayRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewDayForm = (props: Props) => {

    const { form, setForm } = props;
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'dayStart'),
        cardInserted: getText('common', 'insertedCard'),
        doubleCrew: getText('common', 'doubleCrew'),
        startedDayAction: getText('home', 'startedDayAction'),
        startedDayActionCardInsert: getText('home', 'startedDayActionCardInsert'),
    }

    const send = (): void => {
        const sendData: StartDayData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            cardInserted: form.cardInserted,
            doubleCrew: form.doubleCrew,
            action: txt.startedDayAction + (form.cardInserted === 'true' ? ' ' + txt.startedDayActionCardInsert : ''),
        }
        fetchData(API_ENDPOINTS.START_NEW_DAY, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(sendData.action, 'success');
                    props.setlastLogRefresh((prev => !prev));
                    props.setActiveDayRefresh((prev => !prev));
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
                <OnOffSwitch
                    value={form.cardInserted}
                    onChange={(e) => setForm('cardInserted', e)}
                    label={txt.cardInserted}
                />
                <OnOffSwitch
                    value={form.doubleCrew}
                    onChange={(e) => setForm('doubleCrew', e)}
                    label={txt.doubleCrew}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};