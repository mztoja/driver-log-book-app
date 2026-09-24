import { useEffect } from 'react';
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
import { AddDurationSwitch } from '@/components/inputs/commons/AddDurationSwitch';
import { useGlobalState } from '@/hooks/useGlobalState';
import { FuelInput } from '@/components/inputs/commons/FuelInput';
import { extractTime } from '@/utils/extractTime';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveDayRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FinishDayForm = (props: Props) => {

    const { form, setForm, visible } = props;
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const { lang, activeDay, setActiveDay } = useGlobalState();
    const txt = {
        title: getText('home', 'dayStop', lang),
        cardTakeOut: getText('common', 'cardTakeOut', lang),
        finishedDayAction: getText('home', 'finishedDayAction', lang),
        finishedDayActionCardTakeOut: getText('home', 'finishedDayActionCardTakeOut', lang),
        finishedDay: getText('home', 'finishedDay', lang),
        addDriveTimeSwitch: getText('home', 'addDriveTimeSwitch', lang),
        addDriveTimeLabel: getText('home', 'addDriveTimeLabel', lang),
    };

    // Dzień mógł być wcześniej wznowiony po krótkiej przerwie (zob. NewDayForm) — driveTime/
    // driveTime2/fuelBurned zapisane wtedy na dniu to wartości sprzed przerwy. Podpowiadamy je przy
    // otwarciu, żeby użytkownik doliczył do nich nowy odcinek zamiast wpisać tylko sam nowy fragment.
    useEffect(() => {
        if (!visible || !activeDay) return;
        if (activeDay.driveTime && activeDay.driveTime !== '00:00:00') {
            setForm('driveTime', extractTime(activeDay.driveTime));
        }
        if (activeDay.driveTime2 && activeDay.driveTime2 !== '00:00:00') {
            setForm('driveTime2', extractTime(activeDay.driveTime2));
        }
        if (Number(activeDay.fuelBurned) > 0) {
            setForm('fuelCombustion', activeDay.fuelBurned.toString());
        }
        // eslint-disable-next-line
    }, [visible]);

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
        };
        fetchData(API_ENDPOINTS.FINISH_DAY, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.finishedDay, 'success');
                    setActiveDay(null);
                    setForm('fuelCombustion', '');
                    setForm('driveTime', '');
                    setForm('driveTime2', '');
                    props.setlastLogRefresh((prev => !prev));
                    props.setActiveDayRefresh((prev => !prev));
                    props.setVisible(false);
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
                <OdometerInput value={form.odometer} onChange={(e) => setForm('odometer', e)} />
                <PlaceInput
                    place={form.place}
                    placeId={form.placeId}
                    onChange={(e) => setForm('place', e)}
                    onChangeId={(e) => setForm('placeId', e)}
                    country={form.country}
                    onChangeCountry={(e) => setForm('country', e)}
                />
                <AddDurationSwitch
                    value={form.driveTime}
                    onChange={(v) => setForm('driveTime', v)}
                    switchLabel={txt.addDriveTimeSwitch}
                    addLabel={txt.addDriveTimeLabel}
                />
                <DriveTimeInput
                    value={form.driveTime}
                    onChange={(e) => setForm('driveTime', e)}
                />
                {activeDay?.doubleCrew &&
                    <>
                        <AddDurationSwitch
                            value={form.driveTime2}
                            onChange={(v) => setForm('driveTime2', v)}
                            switchLabel={txt.addDriveTimeSwitch}
                            addLabel={txt.addDriveTimeLabel}
                        />
                        <DriveTimeInput
                            value={form.driveTime2}
                            onChange={(e) => setForm('driveTime2', e)}
                            secDriver
                        />
                    </>
                }
                <FuelInput
                    value={form.fuelCombustion}
                    onChange={(e) => setForm('fuelCombustion', e)}
                    type='combustion'
                />
                {activeDay?.cardState === dayCardStateEnum.inserted &&
                    <OnOffSwitch
                        value={form.cardTakeOut}
                        onChange={(e) => setForm('cardTakeOut', e)}
                        label={txt.cardTakeOut}
                    />
                }
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <DateTimeInput value={form.date} onChange={(e) => setForm('date', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
