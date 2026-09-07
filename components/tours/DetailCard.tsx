import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';

export const Card: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.headerBackground }]}>
            {title ? <ThemedText type="defaultSemiBold" style={styles.cardTitle}>{title}</ThemedText> : null}
            {children}
        </View>
    );
};

export const Row: React.FC<{ label: string; value: React.ReactNode; danger?: boolean }> = ({ label, value, danger }) => {
    const { colors } = useTheme();
    return (
        <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>{label}</ThemedText>
            {typeof value === 'string' || typeof value === 'number'
                ? <ThemedText style={[styles.rowValue, danger ? { color: colors.deleteIcon } : null]}>{value}</ThemedText>
                : <View style={styles.rowValueBox}>{value}</View>}
        </View>
    );
};

export const Kpi: React.FC<{ label: string; value: string }> = ({ label, value }) => {
    const { colors } = useTheme();
    return (
        <View style={[styles.kpi, { backgroundColor: colors.background }]}>
            <ThemedText type="defaultSemiBold" style={styles.kpiValue}>{value}</ThemedText>
            <ThemedText style={styles.kpiLabel}>{label}</ThemedText>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 10,
        borderWidth: 1,
        padding: 12,
        gap: 4,
    },
    cardTitle: {
        marginBottom: 4,
        fontSize: 17,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 8,
        paddingVertical: 1,
    },
    rowLabel: {
        opacity: 0.8,
        flexShrink: 1,
    },
    rowValue: {
        fontWeight: '600',
        textAlign: 'right',
        flexShrink: 1,
    },
    rowValueBox: {
        flexShrink: 1,
        alignItems: 'flex-end',
    },
    kpi: {
        flexGrow: 1,
        flexBasis: '45%',
        borderRadius: 8,
        padding: 10,
        alignItems: 'center',
        gap: 2,
    },
    kpiValue: {
        fontSize: 16,
    },
    kpiLabel: {
        fontSize: 12,
        opacity: 0.7,
        textAlign: 'center',
    },
});
