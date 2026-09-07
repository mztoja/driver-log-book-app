import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { SwitchTheme } from '@/components/SwitchTheme';

export default function RoutesStackLayout() {
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
            <Stack.Screen name="index" options={{ title: getText('tours', 'listTitle', lang) }} />
            <Stack.Screen name="[id]/index" options={{ title: getText('tours', 'tour', lang) }} />
            <Stack.Screen name="[id]/logs" options={{ title: getText('tours', 'logsTitle', lang) }} />
            <Stack.Screen name="[id]/days" options={{ title: getText('tours', 'daysTitle', lang) }} />
            <Stack.Screen name="[id]/finances" options={{ title: getText('tours', 'financesTitle', lang) }} />
            <Stack.Screen name="[id]/loads" options={{ title: getText('tours', 'loadsTitle', lang) }} />
        </Stack>
    );
}
