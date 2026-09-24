import { Stack, router, type Href } from 'expo-router';
import { HeaderBackButton } from 'expo-router/react-navigation';
import { useTheme } from '@/hooks/useTheme';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import { HeaderRightButtons } from '@/components/HeaderRightButtons';
import { StackHeader } from '@/components/StackHeader';

export default function RecordsStackLayout() {
    const { colors } = useTheme();
    const { lang } = useGlobalState();

    // Stack otwierany z home (ukryta karta) – pierwszy ekran nie ma domyślnej strzałki,
    // więc zawsze pokazujemy własną: czyści stos i wraca na stronę główną.
    const goHome = () => {
        if (router.canDismiss()) router.dismissAll();
        router.navigate('/home' as Href);
    };

    return (
        <Stack
            screenOptions={{
                header: (props) => <StackHeader {...props} />,
                headerStyle: { backgroundColor: colors.headerBackground },
                headerTitleStyle: { color: colors.text },
                headerTintColor: colors.text,
                headerRight: () => <HeaderRightButtons />,
                headerLeft: (props) => <HeaderBackButton {...props} onPress={goHome} />,
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
