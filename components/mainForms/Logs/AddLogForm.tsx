import { STYLES } from '@/constants/STYLES';
import { ScrollView } from 'react-native';
import { getText } from '@/utils/getText';
import { DateTimeInput } from '../../inputs/commons/DateTimeInput';
import { AddLogData, GeneralFormData } from '@/types';
import { OdometerInput } from '../../inputs/commons/OdometerInput';
import { PlaceInput } from '../../inputs/commons/PlaceInput';
import { ActivityInput } from '../../inputs/commons/ActivityInput';
import { SendButton } from '../../buttons/SendButton';
import { NotesInput } from '../../inputs/commons/NotesInput';
import { useApi } from '@/hooks/useApi';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import { MainFormModal } from '../MainFormModal';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AddLogForm: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm } = props;
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'addLog'),
    }

    const send = (): void => {
        const sendData: AddLogData = {
            date: props.form.date,
            country: props.form.country,
            place: props.form.place,
            placeId: props.form.placeId,
            odometer: props.form.odometer,
            notes: props.form.notes,
            action: props.form.action,
        }
        fetchData(API_ENDPOINTS.CREATE_NEW_LOG, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(getText('home', 'addLogSuccess', lang, form.action), 'success');
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
                <ActivityInput value={form.action} onChange={(e) => setForm('action', e)} />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};