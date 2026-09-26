import { Dimensions, Platform, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeyboardHeight } from './useKeyboardHeight';

/**
 * Pozycja/wysokość okna wyboru wysuwanego od dołu (`STYLES.modaSelectContent`) w RN `Modal`.
 * Na iOS okno modala nie zmniejsza się pod klawiaturę, więc okno z polem wyszukiwania
 * podnosimy o wysokość klawiatury (i w razie potrzeby skracamy, żeby zmieściło się nad nią).
 * Na Androidzie system sam dopasowuje okno modala – tam bez zmian.
 */
export const useSelectSheetStyle = (): ViewStyle => {
    const insets = useSafeAreaInsets();
    const keyboardHeight = useKeyboardHeight();
    const screenHeight = Dimensions.get('window').height;
    const keyboard = Platform.OS === 'ios' ? keyboardHeight : 0;

    if (keyboard > 0) {
        return {
            bottom: keyboard,
            paddingBottom: 10,
            height: Math.min(screenHeight * 0.5, screenHeight - keyboard - insets.top - 20),
        };
    }
    return {
        paddingBottom: 10 + insets.bottom,
        height: screenHeight * 0.5,
    };
};
