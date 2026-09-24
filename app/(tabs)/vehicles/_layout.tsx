import { Stack } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { HeaderRightButtons } from '@/components/HeaderRightButtons';
import { StackHeader } from '@/components/StackHeader';

export default function VehiclesStackLayout() {
    const { colors } = useTheme();
    const { lang } = useGlobalState();

    return (
        <Stack
            screenOptions={{
                header: (props) => <StackHeader {...props} />,
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTitleStyle: { color: colors.text },
                headerTintColor: colors.text,
                headerRight: () => <HeaderRightButtons />,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="index" options={{ title: getText('vehicles', 'listTitle', lang) }} />
            <Stack.Screen name="[id]/services" options={{ title: getText('vehicles', 'showServices', lang) }} />
        </Stack>
    );
}
