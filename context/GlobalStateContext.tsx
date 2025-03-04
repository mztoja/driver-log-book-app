import { DayInterface, LangInterface, LogInterface, PlaceInterface, UserInterface, userLangEnum } from '@/types';
import { Dispatch, createContext, useEffect, useState } from 'react';

interface GlobalStateProviderProps {
    children: React.ReactNode;
}

interface GlobalStateContextProps {
    user: UserInterface | null;
    setUser: Dispatch<React.SetStateAction<UserInterface | null>>;
    lang: LangInterface;
    setLang: Dispatch<React.SetStateAction<LangInterface>>;
    places: PlaceInterface[] | null;
    setPlaces: Dispatch<React.SetStateAction<PlaceInterface[] | null>>;
    lastLog: LogInterface | null;
    setLastLog: Dispatch<React.SetStateAction<LogInterface | null>>;
    activeDay: DayInterface | null;
    setActiveDay: Dispatch<React.SetStateAction<DayInterface | null>>;
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    user: null,
    setUser: () => { },
    lang: 'en',
    setLang: () => { },
    places: null,
    setPlaces: () => { },
    lastLog: null,
    setLastLog: () => { },
    activeDay: null,
    setActiveDay: () => { },
});

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }: GlobalStateProviderProps) => {
    const [user, setUser] = useState<UserInterface | null>(null);
    const [lang, setLang] = useState<LangInterface>('en');
    const [places, setPlaces] = useState<PlaceInterface[] | null>(null);
    const [lastLog, setLastLog] = useState<LogInterface | null>(null);
    const [activeDay, setActiveDay] = useState<DayInterface | null>(null);


    useEffect(() => {
        switch (user?.lang) {
            case userLangEnum.en:
                setLang('en');
                break;
            case userLangEnum.pl:
                setLang('pl');
                break;
        }
    }, [user]);

    useEffect(() => {
        if (places) {
            places.sort((a, b) => {
                if (a.country < b.country) return -1;
                if (a.country > b.country) return 1;
                if (a.code < b.code) return -1;
                if (a.code > b.code) return 1;
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
        }
    }, [places]);

    return (
        <GlobalStateContext.Provider value={{
            user,
            setUser,
            lang,
            setLang,
            places,
            setPlaces,
            lastLog,
            setLastLog,
            activeDay,
            setActiveDay,
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};