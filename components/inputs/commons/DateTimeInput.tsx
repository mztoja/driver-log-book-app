import { STYLES } from '@/constants/STYLES';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { DatePickerModal, TimePickerModal, en, pl, registerTranslation } from 'react-native-paper-dates';
import { CalendarDate } from 'react-native-paper-dates/lib/typescript/Date/Calendar';

registerTranslation('en', en);
registerTranslation('pl', pl);

interface Props {
    value: string;
    onChange: (e: string) => void;
}

export const DateTimeInput: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const today = new Date();
    const defaultTime = {
        hours: today.getHours(),
        minutes: today.getMinutes(),
    };

    const [date, setDate] = useState<CalendarDate>(today);
    const [time, setTime] = useState<{ hours: number; minutes: number }>(defaultTime);
    const [openDate, setOpenDate] = useState<boolean>(false);
    const [openTime, setOpenTime] = useState<boolean>(false);
    const [textInputValue, setTextInputValue] = useState<string>('');

    useEffect(() => {
        if (!date || !time) {
            props.onChange('2100-01-01T06:00');
            setTextInputValue('01.01.2100 06:00');
        } else {
            const year = `${date.getFullYear()}`;
            const month = `${date.getMonth() + 1 < 10 ? '0' : ''}${date.getMonth() + 1}`;
            const day = `${date.getDate() < 10 ? '0' : ''}${date.getDate()}`;
            const hours = `${time.hours < 10 ? '0' : ''}${time.hours}`;
            const minutes = `${time.minutes < 10 ? '0' : ''}${time.minutes}`;
            props.onChange(`${year}-${month}-${day}T${hours}:${minutes}`);
            setTextInputValue(`${day}.${month}.${year} ${hours}:${minutes}`);
        }
    }, [date, time]);


    const addMinute = (): void => {
        if (date && time) {
            const newDate = new Date(date);
            newDate.setHours(time.hours);
            newDate.setMinutes(time.minutes);
            newDate.setMinutes(newDate.getMinutes() + 1);

            setDate(newDate);
            setTime({
                hours: newDate.getHours(),
                minutes: newDate.getMinutes(),
            });
        }
    }

    return (
        <View>
            <View style={STYLES.inputWrapper}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{
                        colors: {
                            primary: colors.text,
                        }
                    }}
                    label={getText('common', 'dateTime')}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={textInputValue}
                    editable={false}
                />

                <View style={STYLES.iconInputWrapper}>
                    <IconButton
                        icon="calendar"
                        size={24}
                        iconColor={colors.text}
                        onPress={() => setOpenDate(true)}
                    />
                    <IconButton
                        icon="clock-outline"
                        size={24}
                        iconColor={colors.text}
                        onPress={() => setOpenTime(true)}
                    />
                    <IconButton
                        icon="clock-plus-outline"
                        size={24}
                        iconColor={colors.actionIcon}
                        onPress={() => addMinute()}
                    />
                </View>
            </View>

            <DatePickerModal
                locale={lang}
                mode="single"
                visible={openDate}
                onDismiss={() => setOpenDate(false)}
                date={date}
                onConfirm={(selectedDate) => {
                    setOpenDate(false);
                    setDate(selectedDate.date);
                    setOpenTime(true);
                }}
            />

            <TimePickerModal
                locale={lang}
                visible={openTime}
                onDismiss={() => setOpenTime(false)}
                onConfirm={(selectedTime) => {
                    setOpenTime(false);
                    setTime(selectedTime);
                }}
                hours={time ? time.hours : 12}
                minutes={time ? time.minutes : 0}
            />
        </View>
    );
};