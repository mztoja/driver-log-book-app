import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useGlobalState } from '@/hooks/useGlobalState';
import { GlobalStateProvider } from '@/context/GlobalStateContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { common } from '@/assets/text/common';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { Snackbar } from '@/components/Snackbar';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { SwitchTheme } from '@/components/SwitchTheme';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { UserInterface } from '@/types';
import getToken from '@/utils/getToken';
import getRefreshToken from '@/utils/getRefreshToken';

const Stacks = () => {

    const { user, lang, setUser } = useGlobalState();
    const { colors } = useTheme();
    const { fetchData } = useApi();
    const [booting, setBooting] = useState<boolean>(true);

    // Auto-login przy starcie: jeśli w SecureStore jest token (access lub refresh),
    // pobierz użytkownika. useApi sam obsłuży 401 -> /auth/refresh -> retry.
    useEffect(() => {
        (async () => {
            try {
                const [access, refresh] = await Promise.all([getToken(), getRefreshToken()]);
                if (access || refresh) {
                    await fetchData<UserInterface>(API_ENDPOINTS.GET, { setData: setUser });
                }
            } finally {
                setBooting(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (booting) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerStyle: { backgroundColor: colors.headerBackground },
                    headerTitleStyle: { color: colors.text },
                    headerTintColor: colors.text,
                    headerRight: () => (<SwitchTheme />),
                }}
            >
                <Stack.Screen name="index" redirect={user !== null} options={{ headerShown: false }} />
                <Stack.Screen name="register" redirect={user !== null} options={{ title: common[lang].registerPageTitle }} />
                <Stack.Screen name="(tabs)" redirect={!user} options={{ headerShown: false }} />
                <Stack.Screen
                    name="+not-found"
                    options={{ title: common.pl.notFoundPageTitle }}
                />
            </Stack>
            <Snackbar />
        </View>
    );
}

const Root = () => {

    return (
        <GlobalStateProvider>
            <ThemeProvider>
                <SnackbarProvider>
                    <Stacks />
                </SnackbarProvider>
            </ThemeProvider>
        </GlobalStateProvider>
    );

}

export default Root;
