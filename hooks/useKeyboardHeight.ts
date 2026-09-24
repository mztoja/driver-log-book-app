import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Aktualna wysokość klawiatury ekranowej (0 gdy schowana).
 * Na Androidzie z edge-to-edge (wymuszone od SDK 54+) system nie zmniejsza okna pod klawiaturę,
 * więc ekrany z polami na dole muszą same zrobić dla niej miejsce (np. paddingBottom w ScrollView).
 */
export const useKeyboardHeight = (): number => {
    const [height, setHeight] = useState<number>(0);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const show = Keyboard.addListener(showEvent, (e) => setHeight(e.endCoordinates.height));
        const hide = Keyboard.addListener(hideEvent, () => setHeight(0));
        return () => {
            show.remove();
            hide.remove();
        };
    }, []);

    return height;
};
