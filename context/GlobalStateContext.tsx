import { LangInterface, UserInterface, userBidTypeEnum, userFuelConDispEnum, userFuelContypeEnum, userLangEnum, userStatusEnum } from '@/types';
import { Dispatch, createContext, useEffect, useState } from 'react';

interface GlobalStateProviderProps {
    children: React.ReactNode;
}

interface GlobalStateContextProps {
    user: UserInterface | null,
    setUser: Dispatch<React.SetStateAction<UserInterface | null>>,
    lang: LangInterface;
    setLang: Dispatch<React.SetStateAction<LangInterface>>,
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    user: null,
    setUser: () => { },
    lang: 'en',
    setLang: () => { },
});

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }: GlobalStateProviderProps) => {
    const [user, setUser] = useState<UserInterface | null>(null);
    const [lang, setLang] = useState<LangInterface>('en');

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

    return (
        <GlobalStateContext.Provider value={{
            user,
            setUser,
            lang,
            setLang,
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};