import React, { JSX, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MainFormModal } from '@/components/mainForms/MainFormModal';
import { SendButton } from '@/components/buttons/SendButton';
import { TextField } from '@/components/records/edit/fields';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { useSnackbar } from '@/hooks/useSnackbar';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { STYLES } from '@/constants/STYLES';
import { getText } from '@/utils/getText';

/** Zaproszenie znajomego po e-mailu – odpowiednik front `AddFriend` (mapa i lista znajomych). */
export const AddFriendModal: React.FC<{ visible: boolean; onClose: () => void; onInvited: () => void }> = (props): JSX.Element => {
    const { lang } = useGlobalState();
    const { fetchData, loading } = useApi();
    const { showSnackbar } = useSnackbar();
    const [email, setEmail] = useState<string>('');

    const invite = (): void => {
        fetchData(API_ENDPOINTS.inviteFriend, { method: 'POST', sendData: { email: email.trim() } }, { showSnackbar })
            .then((res) => {
                if (res.success) {
                    setEmail('');
                    showSnackbar(getText('friends', 'inviteSuccess', lang), 'success');
                    props.onInvited();
                    props.onClose();
                }
            });
    };

    return (
        <MainFormModal visible={props.visible} setVisible={() => props.onClose()} title={getText('friends', 'addFriend', lang)}>
            <ScrollView style={STYLES.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <TextField label={getText('friends', 'email', lang)} value={email} onChange={setEmail} />
                <ThemedText style={styles.consent}>{getText('friends', 'addFriendConsentInfo', lang)}</ThemedText>
                <SendButton onPress={invite} text={getText('friends', 'inviteSubmit', lang)} loading={loading} />
            </ScrollView>
        </MainFormModal>
    );
};

const styles = StyleSheet.create({
    content: { padding: 16, gap: 6 },
    consent: { opacity: 0.85, marginTop: 8 },
});
