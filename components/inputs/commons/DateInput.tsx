import React, { JSX, useState } from 'react';
import { View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { formatShortDate } from '@/utils/formats/formatShortDate';

interface Props {
    label: string;
    // data w formacie "YYYY-MM-DD" (jak <input type="date"> na froncie)
    value: string;
    onChange: (e: string) => void;
}

/** Wybór samej daty (bez godziny) – terminy pojazdu: przegląd, OC, tachograf. */
export const DateInput: React.FC<Props> = (props: Props): JSX.Element => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const [open, setOpen] = useState<boolean>(false);

    // parsujemy tekst bez obiektu Date z konwersją stref (Hermes)
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(props.value ?? '');
    const current = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date();

    return (
        <View>
            <View style={STYLES.inputWrapper}>
                <TextInput
                    style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
                    theme={{ colors: { primary: colors.text } }}
                    label={props.label}
                    textColor={colors.text}
                    placeholderTextColor={colors.text}
                    value={m ? formatShortDate(props.value) : ''}
                    editable={false}
                />
                <View style={STYLES.iconInputWrapper}>
                    <IconButton icon="calendar" size={24} iconColor={colors.text} onPress={() => setOpen(true)} />
                </View>
            </View>
            <DatePickerModal
                locale={lang}
                mode="single"
                visible={open}
                onDismiss={() => setOpen(false)}
                date={current}
                onConfirm={({ date }) => {
                    setOpen(false);
                    if (!date) return;
                    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
                    const dd = `${date.getDate()}`.padStart(2, '0');
                    props.onChange(`${date.getFullYear()}-${mm}-${dd}`);
                }}
            />
        </View>
    );
};
