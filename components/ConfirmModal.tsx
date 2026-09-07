import { Modal, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '@/hooks/useTheme';
import { getText } from '@/utils/getText';
import { ThemedText } from './ThemedText';

type ConfirmModalProps = {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    text?: string;
};

const ConfirmModal = ({ visible, onConfirm, onCancel, text }: ConfirmModalProps) => {
    const { colors } = useTheme();
    return (
        <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: 20,
                }}
            >
                <View
                    style={{
                        backgroundColor: colors.background,
                        padding: 20,
                        borderRadius: 8,
                        width: '100%',
                    }}
                >
                    <ThemedText style={{ marginBottom: 20 }}>
                        {text ?? getText('common', 'confirmation')}
                    </ThemedText>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                        <Button onPress={onCancel} textColor={colors.text}>
                            {getText('common', 'no')}
                        </Button>
                        <Button onPress={onConfirm} mode="contained" buttonColor={colors.buttonColor} textColor={colors.buttonTextColor}>
                            {getText('common', 'yes')}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmModal;
