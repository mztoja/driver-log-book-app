import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { STYLES } from '@/constants/STYLES';
import { UserNoteInterface } from '@/types';
import { getText } from '@/utils/getText';

/**
 * Odpowiednik front `components/main/NotesField.tsx` + `NotesHistory.tsx`:
 * notatka użytkownika zapisywana przy utracie fokusu (każdy zapis = nowy wpis w `user_notes`,
 * backend trzyma 5 ostatnich), ramka sygnalizuje niezapisane zmiany, link otwiera historię.
 */
interface Props {
    // informacja dla ekranu-rodzica, że pole jest edytowane (musi zrobić miejsce na klawiaturę)
    onFocusChange?: (focused: boolean) => void;
}

export const UserNotes: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();
    const { lang } = useGlobalState();
    const { fetchData } = useApi();
    const [text, setText] = useState<string>('');
    const [history, setHistory] = useState<UserNoteInterface[]>([]);
    const [synchronized, setSynchronized] = useState<boolean>(true);
    const [showHistory, setShowHistory] = useState<boolean>(false);
    const savedTextRef = useRef<string>('');
    const textRef = useRef<string>('');
    const txt = {
        title: getText('home', 'userNotes', lang),
        history: getText('home', 'notesHistory', lang),
        historyTitle: getText('home', 'notesHistoryTitle', lang),
    };

    const save = useCallback((): void => {
        const value = textRef.current;
        if (value === savedTextRef.current) return;
        setSynchronized(false);
        fetchData<UserNoteInterface[]>(API_ENDPOINTS.saveUserNote, { method: 'POST', sendData: { notes: value } }).then((res) => {
            if (res.success && Array.isArray(res.responseData)) {
                setHistory(res.responseData);
                savedTextRef.current = value;
                setSynchronized(textRef.current === value);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchData<UserNoteInterface[]>(API_ENDPOINTS.getUserNotes).then((res) => {
            if (Array.isArray(res.responseData)) {
                setHistory(res.responseData);
                const current = res.responseData[0]?.notes ?? '';
                setText(current);
                textRef.current = current;
                savedTextRef.current = current;
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // przy przejściu na inną kartę TextInput nie zawsze dostaje blur – zapisujemy też przy utracie fokusu ekranu
    useFocusEffect(useCallback(() => () => save(), [save]));

    const onChange = (value: string): void => {
        setText(value);
        textRef.current = value;
        setSynchronized(value === savedTextRef.current);
    };

    return (
        <View style={styles.wrap}>
            <ThemedText type="subtitle" style={styles.title}>{txt.title}</ThemedText>
            <TextInput
                style={[STYLES.textInput, {
                    backgroundColor: colors.inputBackground,
                    minHeight: 80,
                    maxHeight: 300,
                    borderWidth: 2,
                    borderColor: synchronized ? 'transparent' : colors.deleteIcon,
                }]}
                theme={{ colors: { primary: colors.text } }}
                value={text}
                onChangeText={onChange}
                onFocus={() => props.onFocusChange?.(true)}
                onBlur={() => {
                    props.onFocusChange?.(false);
                    save();
                }}
                multiline
                textColor={colors.text}
            />
            <Pressable onPress={() => setShowHistory(true)} style={styles.link}>
                <ThemedText type="link">{txt.history}</ThemedText>
            </Pressable>

            <MainFormModal visible={showHistory} setVisible={setShowHistory} title={txt.historyTitle}>
                <ScrollView style={STYLES.scrollView} contentContainerStyle={styles.historyContent}>
                    {history.length === 0 && <ThemedText style={styles.center}>—</ThemedText>}
                    {history.map((entry, i) => (
                        <View
                            key={entry.id}
                            style={i > 0 ? [styles.historyItem, { borderTopColor: colors.headerBackground }] : undefined}
                        >
                            <ThemedText>{entry.notes ?? ''}</ThemedText>
                        </View>
                    ))}
                </ScrollView>
            </MainFormModal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { marginHorizontal: 20, marginBottom: 40 },
    title: { alignSelf: 'center', marginBottom: 8 },
    link: { alignSelf: 'center', marginTop: 8 },
    center: { alignSelf: 'center' },
    historyContent: { padding: 16 },
    historyItem: { borderTopWidth: 1, marginTop: 10, paddingTop: 10 },
});
