import { STYLES } from '@/constants/STYLES';
import { ScrollView } from 'react-native';
import { getText } from '@/utils/getText';
import { DateTimeInput } from '../../inputs/commons/DateTimeInput';
import { BorderCrossData, GeneralFormData } from '@/types';
import { OdometerInput } from '../../inputs/commons/OdometerInput';
import { SendButton } from '../../buttons/SendButton';
import { NotesInput } from '../../inputs/commons/NotesInput';
import { useApi } from '@/hooks/useApi';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import { BorderSelect } from '../../inputs/commons/BorderSelect';
import { MainFormModal } from '../MainFormModal';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BorderCrossForm: React.FC<Props> = (props: Props): JSX.Element => {

    const { form, setForm } = props;
    const { user, lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const txt = {
        title: getText('home', 'crossBorder'),
    }

    const send = (): void => {
        setForm('placeId', '0');
        const sendData: BorderCrossData = {
            placeId: '0',
            place: form.place,
            country: form.country,
            date: form.date,
            notes: form.notes,
            odometer: form.odometer,
            action: getText('home', 'crossBorder', lang) + ': ' + user?.country + ' > ' + form.country,
            addNewBorder: form.addNewBorder,
        }
        fetchData(API_ENDPOINTS.CREATE_BORDER_CROSS, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(sendData.action, 'success');
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
                <BorderSelect
                    addNewBorderChange={(e) => setForm('addNewBorder', e)}
                    country={form.country}
                    countryOnChange={(e) => setForm('country', e)}
                    place={form.place}
                    placeOnChange={(e) => setForm('place', e)}
                />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};