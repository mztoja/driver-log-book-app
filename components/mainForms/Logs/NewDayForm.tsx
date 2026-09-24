import { useEffect, useState } from 'react';
import { STYLES } from '@/constants/STYLES';
import { ScrollView, View } from 'react-native';
import { getText } from '@/utils/getText';
import { AddLogData, dayCardStateEnum, DayInterface, GeneralFormData, StartDayData } from '@/types';
import { DateTimeInput } from '../../inputs/commons/DateTimeInput';
import { OdometerInput } from '../../inputs/commons/OdometerInput';
import { NotesInput } from '../../inputs/commons/NotesInput';
import { SendButton } from '../../buttons/SendButton';
import { MainFormButton } from '../../buttons/MainFormButton';
import { useApi } from '@/hooks/useApi';
import { MainFormModal } from '../MainFormModal';
import { PlaceInput } from '@/components/inputs/commons/PlaceInput';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import ConfirmModal from '@/components/ConfirmModal';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useBaseCountry } from '@/hooks/useBaseCountry';
import { getResumableDay } from '@/utils/getResumableDay';
import { homeNow } from '@/utils/homeNow';
import { formatDateToTime } from '@/utils/formats/formatDateToTime';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveDayRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewDayForm = (props: Props) => {

    const { form, setForm, visible } = props;
    const { lang, activeTour, setActiveDay } = useGlobalState();
    const baseCountry = useBaseCountry();
    const { fetchData, loading } = useApi();
    const { fetchData: fetchResumeCheck } = useApi();
    const { showSnackbar } = useSnackbar();
    const [lastDay, setLastDay] = useState<DayInterface | null>(null);
    const [resumableDay, setResumableDay] = useState<DayInterface | null>(null);
    const [showResumeConfirm, setShowResumeConfirm] = useState<boolean>(false);
    const txt = {
        title: getText('home', 'dayStart', lang),
        cardInserted: getText('common', 'insertedCard', lang),
        doubleCrew: getText('common', 'doubleCrew', lang),
        startedDayAction: getText('home', 'startedDayAction', lang),
        startedDayActionCardInsert: getText('home', 'startedDayActionCardInsert', lang),
        startedDay: getText('home', 'startedDay', lang),
        resumeDayButton: getText('home', 'resumeDayButton', lang),
        resumeDayAction: getText('home', 'resumeDayAction', lang),
        resumedDay: getText('home', 'resumedDay', lang),
    };

    const cardStillInserted = lastDay?.cardState === dayCardStateEnum.inserted;

    // formularz jest zamontowany na stałe na home – dane odświeżamy przy każdym otwarciu
    useEffect(() => {
        if (!visible) return;
        fetchData<DayInterface>(API_ENDPOINTS.getLastDay, { setData: setLastDay })
            .then((res) => {
                if (res.responseData?.cardState === dayCardStateEnum.inserted) {
                    setForm('cardInserted', 'true');
                }
            });
        setResumableDay(null);
        if (activeTour) {
            fetchResumeCheck<DayInterface[]>(`${API_ENDPOINTS.getDaysByTourId}/${activeTour.id}`)
                .then((res) => {
                    setResumableDay(getResumableDay(res.responseData ?? [], homeNow(baseCountry)));
                });
        }
        // eslint-disable-next-line
    }, [visible]);

    const onSuccess = (day: DayInterface, message: string): void => {
        showSnackbar(message, 'success');
        setActiveDay(day);
        props.setlastLogRefresh((prev => !prev));
        props.setActiveDayRefresh((prev => !prev));
        props.setVisible(false);
    };

    const sendResumeDay = (): void => {
        setShowResumeConfirm(false);
        if (!resumableDay) return;
        const sendData: AddLogData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            action: txt.resumeDayAction,
        };
        fetchData<DayInterface>(`${API_ENDPOINTS.RESUME_DAY}/${resumableDay.id}`, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success && res.responseData) {
                    onSuccess(res.responseData, txt.resumedDay);
                }
            });
    };

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
            action: txt.startedDayAction + ' ' + (form.cardInserted === 'true' ? txt.startedDayActionCardInsert : ''),
        };
        if (cardStillInserted) {
            sendData.action = txt.startedDayAction;
        }
        fetchData<DayInterface>(API_ENDPOINTS.START_NEW_DAY, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success && res.responseData) {
                    onSuccess(res.responseData, txt.startedDay);
                }
            });
    };

    return (
        <MainFormModal
            visible={props.visible}
            setVisible={props.setVisible}
            title={txt.title}
        >
            <ScrollView style={STYLES.scrollView}>
                {resumableDay &&
                    <View style={{ marginVertical: 6 }}>
                        <MainFormButton onPress={() => setShowResumeConfirm(true)} text={txt.resumeDayButton} />
                    </View>
                }
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
                    value={form.doubleCrew}
                    onChange={(e) => setForm('doubleCrew', e)}
                    label={txt.doubleCrew}
                />
                {!cardStillInserted &&
                    <OnOffSwitch
                        value={form.cardInserted}
                        onChange={(e) => setForm('cardInserted', e)}
                        label={txt.cardInserted}
                    />
                }
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
            <ConfirmModal
                visible={showResumeConfirm}
                text={resumableDay?.startData
                    ? getText('home', 'resumeDayConfirm', lang, formatDateToTime(String(resumableDay.startData.date)))
                    : ''}
                onConfirm={sendResumeDay}
                onCancel={() => setShowResumeConfirm(false)}
            />
        </MainFormModal>
    );
};
