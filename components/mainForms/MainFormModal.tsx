import { STYLES } from '@/constants/STYLES';
import { useTheme } from '@/hooks/useTheme';
import { Modal, Pressable, View, ScrollView } from 'react-native';
import { Icon } from 'react-native-paper';
import { Snackbar } from '@/components/Snackbar';
import { ThemedText } from '../ThemedText';

interface Props {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
    children: JSX.Element;
}

export const MainFormModal: React.FC<Props> = (props: Props): JSX.Element => {

    const { colors } = useTheme();

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={props.visible}
            onRequestClose={() => {
                props.setVisible(!props.visible);
            }}>
            <View style={[STYLES.modalFormMainView, { backgroundColor: colors.background }]}>

                <View style={[STYLES.modalFormHeader, { backgroundColor: colors.headerBackground }]}>
                    <View style={STYLES.modalFormHeaderBackIcon}>
                        <Pressable onPress={() => props.setVisible(!props.visible)}>
                            <Icon source="arrow-left" size={24} color={colors.text} />
                        </Pressable>
                    </View>
                    <ThemedText type='subtitle'>{props.title}</ThemedText>
                </View>
                {props.children}
                <Snackbar />
            </View>
        </Modal>
    );
};