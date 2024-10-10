import { COLORS } from '@/constants/COLORS';
import React, { createContext, useState } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeProviderProps {
    children: React.ReactNode;
}

interface ThemeContextProps {
    theme: 'light' | 'dark';
    colors: typeof COLORS.light;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
    theme: 'light',
    colors: COLORS.light,
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }): JSX.Element => {
    const systemTheme = useColorScheme();
    const [theme, setTheme] = useState(systemTheme || 'light');

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const colors = COLORS[theme];

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};