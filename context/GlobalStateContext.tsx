import { DayInterface, LangInterface, LoadInterface, LogInterface, PaymentInterface, PlaceInterface, TourInterface, UserInterface, userLangEnum } from '@/types';
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
    paymentMethods: PaymentInterface[] | null;
    setPaymentMethods: Dispatch<React.SetStateAction<PaymentInterface[] | null>>;
    activeTour: TourInterface | null;
    setActiveTour: Dispatch<React.SetStateAction<TourInterface | null>>;
    activeLoads: LoadInterface[] | null;
    setActiveLoads: Dispatch<React.SetStateAction<LoadInterface[] | null>>;
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
    paymentMethods: null,
    setPaymentMethods: () => { },
    activeTour: null,
    setActiveTour: () => { },
    activeLoads: null,
    setActiveLoads: () => { },
});

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }: GlobalStateProviderProps) => {
    const [user, setUser] = useState<UserInterface | null>(null);
    const [lang, setLang] = useState<LangInterface>('en');
    const [places, setPlaces] = useState<PlaceInterface[] | null>(null);
    const [lastLog, setLastLog] = useState<LogInterface | null>(null);
    const [activeDay, setActiveDay] = useState<DayInterface | null>(null);
    const [paymentMethods, setPaymentMethods] = useState<PaymentInterface[] | null>(null);
    const [activeTour, setActiveTour] = useState<TourInterface | null>(null);
    const [activeLoads, setActiveLoads] = useState<LoadInterface[] | null>(null);


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

    useEffect(() => {
        if (paymentMethods) {
            paymentMethods.sort((a, b) => {
                if (a.method < b.method) return -1;
                if (a.method > b.method) return 1;
                return 0;
            });
        }
    }, [paymentMethods]);

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
            paymentMethods,
            setPaymentMethods,
            activeTour,
            setActiveTour,
            activeLoads,
            setActiveLoads,
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};