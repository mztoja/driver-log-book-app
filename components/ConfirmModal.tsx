import { Modal, View, Text, Button } from 'react-native';

type ConfirmModalProps = {
    visible: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmModal = ({ visible, onConfirm, onCancel }: ConfirmModalProps) => (
    <Modal transparent visible={visible}>
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}
        >
            <View
                style={{
                    backgroundColor: 'white',
                    padding: 20,
                    borderRadius: 8,
                }}
            >
                <Text>Czy na pewno?</Text>
                <Button title="Tak" onPress={onConfirm} />
                <Button title="Nie" onPress={onCancel} />
            </View>
        </View>
    </Modal>
);

export default ConfirmModal;
