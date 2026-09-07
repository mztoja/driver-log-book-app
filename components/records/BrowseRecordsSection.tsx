import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router, type Href } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { MainFormButton } from '@/components/buttons/MainFormButton';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';

/**
 * Sekcja „Przeglądaj wpisy" – zawsze widoczna na home (niezależnie od aktywnej trasy).
 * Kieruje do list „wszystkie" (od najnowszych) opartych o ten sam komponent co listy trasy/miejsca.
 */
export const BrowseRecordsSection: React.FC = (): JSX.Element => {
    const { lang } = useGlobalState();
    const t = (k: 'browseRecords' | 'showLogs' | 'showDays' | 'showFinances' | 'showLoads') =>
        getText('tours', k, lang);

    return (
        <View style={styles.wrap}>
            <ThemedText type="subtitle" style={styles.title}>
                {t('browseRecords')}
            </ThemedText>
            <View style={styles.button}>
                <MainFormButton onPress={() => router.push('/records/logs' as Href)} text={t('showLogs')} />
            </View>
            <View style={styles.button}>
                <MainFormButton onPress={() => router.push('/records/days' as Href)} text={t('showDays')} />
            </View>
            <View style={styles.button}>
                <MainFormButton onPress={() => router.push('/records/finances' as Href)} text={t('showFinances')} />
            </View>
            <View style={styles.button}>
                <MainFormButton onPress={() => router.push('/records/loads' as Href)} text={t('showLoads')} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { marginHorizontal: 40, marginVertical: 20, gap: 4 },
    title: { alignSelf: 'center', marginBottom: 8 },
    button: { marginVertical: 5 },
});
