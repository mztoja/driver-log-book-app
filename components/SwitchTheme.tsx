import { Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/hooks/useTheme';

export const SwitchTheme: React.FC = (): JSX.Element => {

    const { theme, colors, toggleTheme } = useTheme();

    return (
        <Pressable
            onPress={() => toggleTheme()}
            style={{ marginRight: 10 }}
        >
            <MaterialIcons
                name={theme === 'dark' ? 'light-mode' : 'dark-mode'}
                size={24}
                color={colors.tabIconDefault}
            />
        </Pressable>
    );
}