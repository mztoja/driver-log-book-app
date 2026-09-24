import { STYLES } from '@/constants/STYLES';
import { ScrollView } from 'react-native';
import { getText } from '@/utils/getText';
import { AddBreakData, DayInterface, GeneralFormData } from '@/types';
import { DateTimeInput } from '../../inputs/commons/DateTimeInput';
import { OdometerInput } from '../../inputs/commons/OdometerInput';
import { NotesInput } from '../../inputs/commons/NotesInput';
import { SendButton } from '../../buttons/SendButton';
import { useApi } from '@/hooks/useApi';
import { MainFormModal } from '../MainFormModal';
import { PlaceInput } from '@/components/inputs/commons/PlaceInput';
import { OnOffSwitch } from '@/components/inputs/commons/OnOffSwitch';
import { DriveTimeInput } from '@/components/inputs/commons/DriveTimeInput';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useGlobalState } from '@/hooks/useGlobalState';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    form: GeneralFormData;
    setForm: (key: keyof GeneralFormData, value: string) => void;
    setlastLogRefresh: React.Dispatch<React.SetStateAction<boolean>>;
    setActiveDayRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Odpowiednik front `AddBreak.tsx`: przerwa (pojedyncza obsada) albo zmiana kierowcy / przerwa
 * w podwójnej obsadzie (scenariusze break / changeSlot1 / changeSlot2 + numer slotu).
 */
export const AddBreakForm = (props: Props) => {

    const { form, setForm } = props;
    const { lang, activeDay, setActiveDay } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const doubleCrew = !!activeDay?.doubleCrew;
    const txt = {
        title: doubleCrew ? getText('home', 'driverChange', lang) : getText('home', 'addBreak', lang),
        changeSlot1Action: getText('home', 'changeSlot1Action', lang),
        changeSlot2Action: getText('home', 'changeSlot2Action', lang),
        success: getText('home', 'addBreakSuccess', lang),
        breakTakenLabel: getText('home', 'breakTakenLabel', lang),
        breakDriveTimeLabel: getText('home', 'breakDriveTimeLabel', lang),
        breakDriveTimeHelper: getText('home', 'breakDriveTimeHelper', lang),
        breakOnlyBreakSwitch: getText('home', 'breakOnlyBreakSwitch', lang),
        myCardInSlot1: getText('home', 'myCardInSlot1', lang),
        changeToSlot1: getText('home', 'changeToSlot1', lang),
        changeToSlot2: getText('home', 'changeToSlot2', lang),
    };

    const send = (): void => {
        let action: string;
        let slot: number;
        let scenario: AddBreakData['scenario'];
        if (!doubleCrew) {
            action = getText('home', 'addBreakAction', lang, form.breakTaken);
            slot = 1;
            scenario = 'break';
        } else if (form.breakOnlyBreak === 'true') {
            action = getText('home', 'addBreakAction', lang, form.breakTaken);
            slot = form.breakMyCardInSlot1 === 'true' ? 1 : 2;
            scenario = 'break';
        } else if (form.breakChangeToSlot1 === 'true') {
            action = txt.changeSlot1Action;
            slot = 2;
            scenario = 'changeSlot1';
        } else {
            action = txt.changeSlot2Action;
            slot = 1;
            scenario = 'changeSlot2';
        }

        const sendData: AddBreakData = {
            date: form.date,
            country: form.country,
            place: form.place,
            placeId: form.placeId,
            odometer: form.odometer,
            notes: form.notes,
            action,
            driveTime: form.breakDriveTime,
            slot,
            scenario,
        };
        fetchData<DayInterface>(API_ENDPOINTS.ADD_BREAK, { method: 'POST', sendData }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    showSnackbar(txt.success, 'success');
                    if (res.responseData) {
                        setActiveDay(res.responseData);
                    }
                    props.setlastLogRefresh((prev => !prev));
                    props.setActiveDayRefresh((prev => !prev));
                    setForm('breakTaken', '');
                    setForm('breakDriveTime', '');
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
                {(!doubleCrew || form.breakOnlyBreak === 'true') &&
                    <DriveTimeInput
                        value={form.breakTaken}
                        onChange={(e) => setForm('breakTaken', e)}
                        label={txt.breakTakenLabel}
                        helperText=''
                    />
                }
                <DriveTimeInput
                    value={form.breakDriveTime}
                    onChange={(e) => setForm('breakDriveTime', e)}
                    label={txt.breakDriveTimeLabel}
                    helperText={txt.breakDriveTimeHelper}
                />
                {doubleCrew &&
                    <>
                        <OnOffSwitch
                            label={txt.breakOnlyBreakSwitch}
                            value={form.breakOnlyBreak}
                            onChange={(e) => setForm('breakOnlyBreak', e)}
                        />
                        {form.breakOnlyBreak === 'true'
                            ? <OnOffSwitch
                                label={txt.myCardInSlot1}
                                value={form.breakMyCardInSlot1}
                                onChange={(e) => setForm('breakMyCardInSlot1', e)}
                            />
                            : <OnOffSwitch
                                label={form.breakChangeToSlot1 === 'true' ? txt.changeToSlot1 : txt.changeToSlot2}
                                value={form.breakChangeToSlot1}
                                onChange={(e) => setForm('breakChangeToSlot1', e)}
                            />
                        }
                    </>
                }
                <NotesInput value={form.notes} onChange={(e) => setForm('notes', e)} />
                <SendButton onPress={send} text={txt.title} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};
