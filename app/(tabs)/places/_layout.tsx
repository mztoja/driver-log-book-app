import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { SwitchTheme } from '@/components/SwitchTheme';

export default function PlacesStackLayout() {
    const { colors } = useTheme();
    const { lang } = useGlobalState();

    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTitleStyle: { color: colors.text },
                headerTintColor: colors.text,
                headerRight: () => <SwitchTheme />,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="index" options={{ title: getText('places', 'listTitle', lang) }} />
            <Stack.Screen name="[id]/logs" options={{ title: getText('places', 'showActivities', lang) }} />
        </Stack>
    );
}
