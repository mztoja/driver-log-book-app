import { createContext, useState, useContext } from 'react';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

interface SnackbarContextInterface {
    visible: boolean;
    message: string;
    showSnackbar: (message: string, type: SnackbarType) => void;
    hideSnackbar: () => void;
    type: SnackbarType;
}

interface SnackbarProviderProps {
    children: React.ReactNode;
}

export const SnackbarContext = createContext<SnackbarContextInterface>({
    visible: false,
    message: '',
    showSnackbar: () => { },
    hideSnackbar: () => { },
    type: 'info',
});

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }): JSX.Element => {
    const [visible, setVisible] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const [type, setType] = useState<SnackbarType>('info');

    const showSnackbar = (msg: string, type: SnackbarType) => {
        setMessage(msg);
        setType(type);
        setVisible(true);
    };

    const hideSnackbar = () => {
        setVisible(false);
    };

    return (
        <SnackbarContext.Provider value={{ visible, message, showSnackbar, hideSnackbar, type }}>
            {children}
        </SnackbarContext.Provider>
    );
};