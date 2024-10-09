import { UserInterface, userBidTypeEnum, userFuelConDispEnum, userFuelContypeEnum, userLangEnum, userStatusEnum } from '@/types';
import React, { createContext, useState } from 'react';

const defaultUser: UserInterface = {
    id: '1',
    email: 'mztoja@gmail.com',
    bid: 0,
    bidType: userBidTypeEnum.notSpecified,
    companyId: 0,
    country: 'PL',
    currency: 'PLN',
    currentTokenId: '',
    customer: '',
    firstName: 'Marcin',
    lastName: 'Zyskowski',
    lang: userLangEnum.pl,
    fuelConDisp: userFuelConDispEnum.litersPer100km,
    fuelConType: userFuelContypeEnum.liters,
    markedArrive: 0,
    markedDepart: 0,
    notes: '',
    pwdHash: '',
    registerAt: '',
    status: userStatusEnum.active,
    tourGenerator: '',
}

interface GlobalStateProviderProps {
    children: React.ReactNode;
}

interface GlobalStateContextProps {
    user: UserInterface | null,
    setUser: React.Dispatch<React.SetStateAction<UserInterface | null>>,
    lang: 'pl' | 'en';
}

export const GlobalStateContext = createContext<GlobalStateContextProps>({
    user: null,
    setUser: () => { },
    lang: 'en',
});

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }: GlobalStateProviderProps) => {
    const [user, setUser] = useState<UserInterface | null>(null);
    const [lang, setLang] = useState<'pl' | 'en'>('en');

    return (
        <GlobalStateContext.Provider value={{ user, setUser, lang }}>
            {children}
        </GlobalStateContext.Provider>
    );
};