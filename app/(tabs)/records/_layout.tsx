import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { SwitchTheme } from '@/components/SwitchTheme';

export default function RecordsStackLayout() {
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
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="logs" options={{ title: getText('tours', 'logsTitle', lang) }} />
            <Stack.Screen name="days" options={{ title: getText('tours', 'daysTitle', lang) }} />
            <Stack.Screen name="finances" options={{ title: getText('tours', 'financesTitle', lang) }} />
            <Stack.Screen name="loads" options={{ title: getText('tours', 'loadsTitle', lang) }} />
        </Stack>
    );
}
