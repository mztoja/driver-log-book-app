import { Stack } from 'expo-router';
import { useGlobalState } from '@/hooks/useGlobalState';
import { GlobalStateProvider } from '@/context/GlobalStateContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { common } from '@/assets/text/common';
import { SnackbarProvider } from '@/context/SnackbarContext';
import { View } from 'react-native';
import { Snackbar } from '@/components/Snackbar';

const Stacks = () => {

    const { user } = useGlobalState();

    return (
        <SnackbarProvider>
            <View style={{ flex: 1 }}>
                <Stack>
                    <Stack.Screen name="index" redirect={user !== null} options={{ headerShown: false }} />
                    <Stack.Screen name="(tabs)" redirect={!user} options={{ headerShown: false }} />
                    <Stack.Screen
                        name="+not-found"
                        options={{ title: common.pl.notFoundPageTitle }}
                    />
                </Stack>
                <Snackbar />
            </View>
        </SnackbarProvider>
    );
}

const Root = () => {

    return (
        <GlobalStateProvider>
            <ThemeProvider>
                <Stacks />
            </ThemeProvider>
        </GlobalStateProvider>
    );

}

export default Root;