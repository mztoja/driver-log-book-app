import { JSX, useEffect, useRef, useState } from 'react';
import { BackHandler, Dimensions, StyleSheet, View } from 'react-native';
import { Portal } from 'react-native-paper';
import { Header, HeaderBackButton, useIsFocused } from 'expo-router/react-navigation';
import { useTabBarHeight } from '@/utils/tabBarHeightStore';
import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight';
import { HeaderRightButtons } from '@/components/HeaderRightButtons';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    children: React.ReactNode;
}

/**
 * Okno formularza jako nakładka (Portal -> Portal.Host nad nawigatorem Tabs), a nie systemowy
 * <Modal>. Modal na Androidzie z edge-to-edge (SDK 54+) jest osobnym oknem na cały ekran: przykrywał
 * dolne zakładki, a nagłówek wchodził pod pasek statusu. Nakładka zakrywa ekran od samej góry do
 * dolnych zakładek, a jej nagłówek to TEN SAM komponent `Header` co na zakładkach i w stackach
 * (StackHeader): tytuł, strzałka wstecz, przełącznik motywu i ustawienia profilu w tych samych miejscach.
 */
export const MainFormModal: React.FC<Props> = (props: Props): JSX.Element | null => {
    const { colors } = useTheme();
    const keyboardHeight = useKeyboardHeight();
    const tabBarHeight = useTabBarHeight();
    // host portalu jest wspólny dla wszystkich zakładek – pokazujemy tylko formularz aktywnego ekranu
    // (po powrocie na zakładkę otwarty formularz znów się pojawia)
    const isFocused = useIsFocused();
    const viewRef = useRef<View>(null);
    // odległość dolnej krawędzi nakładki od dołu ekranu (zakładki + pasek nawigacji systemu) –
    // klawiatura zasłania tylko to, co wystaje ponad nią
    const [bottomGap, setBottomGap] = useState<number>(0);

    const close = (): void => props.setVisible(false);

    const shown = props.visible && isFocused;

    // systemowy przycisk „wstecz" zamyka formularz (jak onRequestClose w Modal)
    useEffect(() => {
        if (!shown) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            props.setVisible(false);
            return true;
        });
        return () => sub.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shown]);

    if (!shown) return null;

    const measure = (): void => {
        viewRef.current?.measureInWindow((_x, y, _w, h) => {
            setBottomGap(Math.max(0, Dimensions.get('window').height - (y + h)));
        });
    };

    return (
        <Portal>
            <View
                ref={viewRef}
                onLayout={measure}
                style={[
                    // od samej góry (Header sam dolicza pasek statusu) do dolnych zakładek
                    { position: 'absolute', left: 0, right: 0, top: 0, bottom: tabBarHeight },
                    STYLES.modalFormMainView,
                    styles.overlay,
                    { backgroundColor: colors.background, paddingBottom: Math.max(0, keyboardHeight - bottomGap) },
                ]}
            >
                <View style={styles.header}>
                    <Header
                        title={props.title}
                        headerStyle={{ backgroundColor: colors.headerBackground }}
                        headerTitleStyle={{ color: colors.text }}
                        headerTintColor={colors.text}
                        headerLeft={(p) => <HeaderBackButton {...p} onPress={close} />}
                        headerRight={() => <HeaderRightButtons />}
                    />
                </View>
                {props.children}
            </View>
        </Portal>
    );
};

const styles = StyleSheet.create({
    overlay: { borderRadius: 0, zIndex: 100, elevation: 100 },
    header: { alignSelf: 'stretch' },
});
