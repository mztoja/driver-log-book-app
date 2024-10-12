import CONFIG from '@/constants/CONFIG';
import { useSnackbar } from '@/hooks/useSnackbar';
import { useTheme } from '@/hooks/useTheme';
import { Pressable } from 'react-native';
import { Snackbar as BaseSnackbar } from 'react-native-paper';
import { Text } from 'react-native-paper';

export const Snackbar: React.FC = (): JSX.Element => {
    const { visible, message, hideSnackbar, type } = useSnackbar();
    const { colors } = useTheme();
    let backgroundColor = '';
    let textColor = '';
    switch (type) {
        case 'error':
            backgroundColor = colors.snackbarErrorBackground;
            textColor = colors.snackbarErrorText;
            break;
        case 'info':
            backgroundColor = colors.snackbarInfoBackground;
            textColor = colors.snackbarInfoText;
            break;
        case 'success':
            backgroundColor = colors.snackbarSuccessBackground;
            textColor = colors.snackbarSuccessText;
            break;
        case 'warning':
            backgroundColor = colors.snackbarWarningBackground;
            textColor = colors.snackbarWarningText;
            break;
        default:
            backgroundColor = colors.snackbarInfoBackground;
            textColor = colors.snackbarInfoText;
            break;
    }

    return (
        <BaseSnackbar
            visible={visible}
            style={{ backgroundColor, marginBottom: 50 }}
            onDismiss={hideSnackbar}
            duration={CONFIG.SNACKBAR_DURATION}
        >
            <Pressable onPress={hideSnackbar}>
                <Text style={{ color: textColor }}>
                    {message}
                </Text>
            </Pressable>
        </BaseSnackbar>

    );
};