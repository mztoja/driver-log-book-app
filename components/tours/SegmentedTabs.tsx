import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/hooks/useTheme';

interface Props<K extends string> {
    value: K;
    onChange: (key: K) => void;
    tabs: { key: K; label: string }[];
}

export function SegmentedTabs<K extends string>({ value, onChange, tabs }: Props<K>): JSX.Element {
    const { colors } = useTheme();
    return (
        <View style={[styles.wrap, { backgroundColor: colors.headerBackground }]}>
            {tabs.map((tab) => {
                const active = tab.key === value;
                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => onChange(tab.key)}
                        style={[styles.tab, active && { backgroundColor: colors.tabIconSelected }]}
                    >
                        <ThemedText
                            style={[styles.label, active ? { color: '#fff', fontWeight: '700' } : { opacity: 0.75 }]}
                        >
                            {tab.label}
                        </ThemedText>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: 'row',
        padding: 4,
        gap: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
    },
    label: {
        fontSize: 13,
    },
});
