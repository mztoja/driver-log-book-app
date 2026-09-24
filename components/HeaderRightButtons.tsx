import { JSX } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import { router, useSegments, type Href } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useTheme } from '@/hooks/useTheme';
import { SwitchTheme } from '@/components/SwitchTheme';

/**
 * Prawa strona nagłówka dla zalogowanego użytkownika: przełącznik motywu + ustawienia profilu.
 * Wspólna dla nagłówka kart i zagnieżdżonych stacków (routes/places/records).
 */
export const HeaderRightButtons: React.FC = (): JSX.Element => {
    const { colors } = useTheme();
    const isProfileScreen = (useSegments() as string[]).includes('profile');

    return (
        <View style={styles.row}>
            <SwitchTheme />
            <Pressable onPress={() => router.push('/profile' as Href)} style={styles.profile}>
                <AntDesign
                    name="setting"
                    size={24}
                    color={!isProfileScreen ? colors.tabIconDefault : colors.tabIconSelected}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    profile: { marginRight: 10 },
});
