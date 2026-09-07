import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Icon, TextInput } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import { useGlobalState } from '@/hooks/useGlobalState';
import { extractDigits } from '@/utils/extractDigits';
import { extractNumberWithDecimal } from '@/utils/extractNumberWithDecimal';
import { extractTime } from '@/utils/extractTime';
import { DateTimeInput } from '@/components/inputs/commons/DateTimeInput';
import { OdometerInput } from '@/components/inputs/commons/OdometerInput';
import { PlaceInput } from '@/components/inputs/commons/PlaceInput';
import { ActivityInput } from '@/components/inputs/commons/ActivityInput';
import { NotesInput } from '@/components/inputs/commons/NotesInput';
import { LogEditData } from '@/types';

/** Prosty numeryczny input z etykietą (dystans, ilość itp.) */
export const NumberField: React.FC<{
    label: string;
    value: string;
    onChange: (e: string) => void;
    decimal?: boolean;
}> = ({ label, value, onChange, decimal }) => {
    const { colors } = useTheme();
    return (
        <TextInput
            style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
            theme={{ colors: { primary: colors.text } }}
            label={label}
            value={value}
            onChangeText={(v) => onChange(decimal ? extractNumberWithDecimal(v) : extractDigits(v))}
            textColor={colors.text}
            placeholderTextColor={colors.text}
            keyboardType="numeric"
        />
    );
};

/** Input czasu w formacie HH:MM / HHH:MM (czas jazdy, pracy, przerwy) */
export const TimeField: React.FC<{
    label: string;
    value: string;
    onChange: (e: string) => void;
}> = ({ label, value, onChange }) => {
    const { colors } = useTheme();
    return (
        <TextInput
            style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
            theme={{ colors: { primary: colors.text } }}
            label={label}
            value={value}
            onChangeText={(v) => onChange(extractTime(v, true))}
            textColor={colors.text}
            placeholderTextColor={colors.text}
            keyboardType="numeric"
        />
    );
};

/** Zwykły tekstowy input z etykietą (nr rejestracyjny pojazdu itp.) */
export const TextField: React.FC<{
    label: string;
    value: string;
    onChange: (e: string) => void;
}> = ({ label, value, onChange }) => {
    const { colors } = useTheme();
    return (
        <TextInput
            style={[STYLES.textInput, { backgroundColor: colors.inputBackground }]}
            theme={{ colors: { primary: colors.text } }}
            label={label}
            value={value}
            onChangeText={onChange}
            textColor={colors.text}
            placeholderTextColor={colors.text}
        />
    );
};

/** Zestaw pól opisujących log powiązany z rekordem (data / przebieg / miejsce / [czynność] / notatki) */
export const LogFieldset: React.FC<{
    title?: string;
    value: LogEditData;
    onChange: (key: keyof LogEditData, value: string) => void;
    showActivity?: boolean;
}> = ({ title, value, onChange, showActivity }) => (
    <View>
        {title ? (
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
                {title}
            </ThemedText>
        ) : null}
        <DateTimeInput value={value.date} initialValue={value.date} onChange={(e) => onChange('date', e)} />
        <OdometerInput value={value.odometer} onChange={(e) => onChange('odometer', e)} disableHelper />
        <PlaceInput
            place={value.place}
            placeId={value.placeId}
            onChange={(e) => onChange('place', e)}
            onChangeId={(e) => onChange('placeId', e)}
            country={value.country}
            onChangeCountry={(e) => onChange('country', e)}
        />
        {showActivity && <ActivityInput value={value.action} onChange={(e) => onChange('action', e)} />}
        <NotesInput value={value.notes} onChange={(e) => onChange('notes', e)} />
    </View>
);

/** Wybór miejsca z listy adresowej – tylko po id (nadawca / odbiorca ładunku) */
export const PlaceIdField: React.FC<{
    label: string;
    placeId: string;
    onChange: (id: string) => void;
}> = ({ label, placeId, onChange }) => {
    const { places, user } = useGlobalState();
    const [country, setCountry] = useState<string>(
        places?.find((p) => p.id === Number(placeId))?.country ?? user?.country ?? 'PL',
    );
    return (
        <PlaceInput
            place=""
            placeId={placeId}
            onChange={() => undefined}
            onChangeId={onChange}
            country={country}
            onChangeCountry={setCountry}
            options={{ label, disablePlaceText: true }}
        />
    );
};

/** Przełącznik „Pokaż / ukryj pozostałe pola" */
export const MoreFieldsToggle: React.FC<{ expanded: boolean; onToggle: () => void }> = ({ expanded, onToggle }) => {
    const { colors } = useTheme();
    const { lang } = useGlobalState();
    return (
        <Pressable onPress={onToggle} style={styles.toggle}>
            <Icon source={expanded ? 'chevron-up' : 'chevron-down'} size={22} color={colors.actionIcon} />
            <ThemedText>
                {expanded ? getText('tours', 'showLessFields', lang) : getText('tours', 'showMoreFields', lang)}
            </ThemedText>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    sectionTitle: { fontSize: 16, marginTop: 12, marginBottom: 2 },
    toggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
    },
});
