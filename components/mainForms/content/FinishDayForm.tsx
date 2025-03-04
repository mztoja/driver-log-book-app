import { STYLES } from '@/constants/STYLES';
import { ScrollView } from 'react-native';
import { getText } from '@/utils/getText';
import { GeneralFormData, StopDayData, dayCardStateEnum } from '@/types';
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
import { DriveTimeInput } from '@/components/inputs/commons/DriveTimeInput';
import { useGlobalState } from '@/hooks/useGlobalState';
import { FuelInput } from '@/components/inputs/commons/FuelInput';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveDayRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FinishDayForm = (props: Props) => {

    const { form, setForm } = props;
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const { activeDay } = useGlobalState();
    const txt = {
        title: getText('home', 'dayStop'),
        cardTakeOut: getText('common', 'cardTakeOut'),
        finishedDayAction: getText('home', 'finishedDayAction'),
        finishedDayActionCardTakeOut: getText('home', 'finishedDayActionCardTakeOut'),
    }

    const send = (): void => {
        const sendData: StopDayData = {
            cardTakeOut: form.cardTakeOut,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            date: form.date,
            fuelCombustion: form.fuelCombustion,
            driveTime: form.driveTime,
            driveTime2: form.driveTime2,
            action: txt.finishedDayAction + ' ' + (form.cardTakeOut === 'true' ? txt.finishedDayActionCardTakeOut : ''),
        }
        fetchData(API_ENDPOINTS.FINISH_DAY, { method: 'POST', sendData }, { showSnackbar })
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
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <FuelInput
                    value={form.fuelCombustion}
                    onChange={(e) => setForm('fuelCombustion', e)}
                    type='combustion'
                />
                <DriveTimeInput
                    value={form.driveTime}
                    onChange={(e) => setForm('driveTime', e)}
                />
                {activeDay?.doubleCrew &&
                    <DriveTimeInput
                        value={form.driveTime2}
                        onChange={(e) => setForm('driveTime2', e)}
                        secDriver
                    />
                }
                {activeDay?.cardState === dayCardStateEnum.inserted &&
                    <OnOffSwitch
                        value={form.cardTakeOut}
                        onChange={(e) => setForm('cardTakeOut', e)}
                        label={txt.cardTakeOut}
                    />
                }
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};