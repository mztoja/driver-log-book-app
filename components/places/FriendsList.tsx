import React, { JSX, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { IconButton } from 'react-native-paper';
import { ThemedText } from '@/components/ThemedText';
import ConfirmModal from '@/components/ConfirmModal';
import { useTheme } from '@/hooks/useTheme';
import { useApi } from '@/hooks/useApi';
import { useGlobalState } from '@/hooks/useGlobalState';
import { getText } from '@/utils/getText';
import API_ENDPOINTS from '@/constants/API_ENDPOINTS';
import { FriendRequestInterface, FriendsInterface, FriendsListInterface, FriendSummaryInterface } from '@/types';
import { FriendPositionInfo } from '@/components/places/FriendPositionInfo';
import { AddFriendModal } from '@/components/places/AddFriendModal';

/**
 * Karta „Znajomi" na ekranie Adresy – odpowiednik front `FriendsList`: prosta lista znajomych
 * z aktualnymi informacjami (jak po kliknięciu pinezki na mapie) oraz obsługa zaproszeń.
 */
export const FriendsList: React.FC = (): JSX.Element => {
    const { colors } = useTheme();
    const { fetchData, loading } = useApi();
    const { lang } = useGlobalState();
    const f = (k: keyof FriendsInterface['en']) => getText('friends', k, lang);

    const [friends, setFriends] = useState<FriendsListInterface | null>(null);
    const [addVisible, setAddVisible] = useState<boolean>(false);
    const [toRemove, setToRemove] = useState<FriendSummaryInterface | null>(null);

    const refresh = useCallback(() => {
        fetchData<FriendsListInterface>(API_ENDPOINTS.getFriends, { setData: setFriends });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useFocusEffect(useCallback(() => refresh(), [refresh]));

    // decline usuwa relację w każdym stanie (odrzucenie / anulowanie / usunięcie); endpointy
    // zwracają pustą odpowiedź, więc po prostu odświeżamy (jak front)
    const respond = (friendshipId: number, accept: boolean): void => {
        const path = accept ? API_ENDPOINTS.acceptFriendRequest : API_ENDPOINTS.declineFriendRequest;
        fetchData(path, { method: 'POST', sendData: { id: friendshipId } }).finally(refresh);
    };

    const removeFriend = (): void => {
        if (!toRemove) return;
        const id = toRemove.friendshipId;
        setToRemove(null);
        respond(id, false);
    };

    if (!friends && loading) {
        return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.text} />;
    }

    const cardStyle = [styles.card, { backgroundColor: colors.inputBackground, borderColor: colors.headerBackground }];

    const renderRequest = (r: FriendRequestInterface, incoming: boolean): JSX.Element => (
        <View key={r.friendshipId} style={styles.requestRow}>
            <ThemedText style={{ flex: 1 }}>{r.firstName} {r.lastName} ({r.email})</ThemedText>
            {incoming &&
                <IconButton icon="check" size={20} iconColor={colors.actionIcon}
                            accessibilityLabel={f('accept')} onPress={() => respond(r.friendshipId, true)} />
            }
            <IconButton icon="close" size={20} iconColor={colors.deleteIcon}
                        accessibilityLabel={incoming ? f('decline') : f('cancelInvite')}
                        onPress={() => respond(r.friendshipId, false)} />
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <AddFriendModal visible={addVisible} onClose={() => setAddVisible(false)} onInvited={refresh} />
            <ConfirmModal
                visible={toRemove !== null}
                text={toRemove ? getText('friends', 'removeFriendConfirm', lang, `${toRemove.firstName} ${toRemove.lastName}`) : ''}
                onConfirm={removeFriend}
                onCancel={() => setToRemove(null)}
            />

            <ScrollView
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.text} />}
            >
                {!!friends?.incoming.length && (
                    <View style={cardStyle}>
                        <ThemedText type="defaultSemiBold">{f('incomingRequestsHeader')}</ThemedText>
                        {friends.incoming.map((r) => renderRequest(r, true))}
                    </View>
                )}
                {!!friends?.outgoing.length && (
                    <View style={cardStyle}>
                        <ThemedText type="defaultSemiBold">{f('outgoingRequestsHeader')}</ThemedText>
                        {friends.outgoing.map((r) => renderRequest(r, false))}
                    </View>
                )}

                {friends?.self && (
                    <View style={[...cardStyle, { borderColor: colors.actionIcon }]}>
                        <ThemedText type="defaultSemiBold">
                            {f('selfLabel')} ({friends.self.firstName} {friends.self.lastName})
                        </ThemedText>
                        <FriendPositionInfo position={friends.self.position} cargo={friends.self.cargo} />
                    </View>
                )}

                {friends?.accepted.map((fr) => (
                    <View key={fr.friendshipId} style={cardStyle}>
                        <View style={styles.cardHead}>
                            <View style={{ flex: 1 }}>
                                <ThemedText type="defaultSemiBold">{fr.firstName} {fr.lastName}</ThemedText>
                                <ThemedText style={styles.dim}>{fr.email}</ThemedText>
                            </View>
                            <IconButton icon="account-remove" size={22} iconColor={colors.deleteIcon}
                                        accessibilityLabel={f('removeFriend')} onPress={() => setToRemove(fr)} />
                        </View>
                        <FriendPositionInfo position={fr.position} cargo={fr.cargo} />
                    </View>
                ))}

                {friends && friends.accepted.length === 0 && (
                    <ThemedText style={styles.empty}>{f('noFriends')}</ThemedText>
                )}
            </ScrollView>

            <IconButton
                icon="account-plus"
                size={28}
                mode="contained"
                containerColor={colors.buttonColor}
                iconColor={colors.buttonTextColor}
                style={styles.fab}
                onPress={() => setAddVisible(true)}
                accessibilityLabel={f('addFriend')}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    list: { padding: 12, gap: 10, paddingBottom: 90 },
    card: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 6 },
    cardHead: { flexDirection: 'row', alignItems: 'center' },
    requestRow: { flexDirection: 'row', alignItems: 'center' },
    dim: { opacity: 0.7, fontSize: 13 },
    empty: { textAlign: 'center', marginTop: 20, opacity: 0.7 },
    fab: { position: 'absolute', right: 16, bottom: 24, borderRadius: 30 },
});
