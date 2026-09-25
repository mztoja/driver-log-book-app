import { useSyncExternalStore } from 'react';

/*
 * Wysokość dolnego paska zakładek (z insetem systemowym) dla nakładki formularzy (MainFormModal).
 * Nakładka renderuje się w Portal.Host NAD nawigatorem Tabs (żeby zastąpić górny pasek), więc nie
 * ma dostępu do kontekstu BottomTabBarHeight – ekrany zakładek zgłaszają ją tutaj (screenLayout).
 */
let height = 0;
const listeners = new Set<() => void>();

export const setTabBarHeight = (value: number): void => {
    if (value === height) return;
    height = value;
    listeners.forEach((l) => l());
};

const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const useTabBarHeight = (): number => useSyncExternalStore(subscribe, () => height);
