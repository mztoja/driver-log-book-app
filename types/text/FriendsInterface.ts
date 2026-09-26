interface Entries {
    friendsToggleLabel: string;
    friendsTab: string;
    outgoingRequestsHeader: string;
    cancelInvite: string;
    noFriends: string;
    placesToggleLabel: string;
    selfLabel: string;
    addFriend: string;
    addFriendConsentInfo: string;
    email: string;
    inviteSubmit: string;
    inviteSuccess: string;
    incomingRequestsHeader: string;
    accept: string;
    decline: string;
    removeFriend: string;
    removeFriendConfirm(x: string): string;
    lastPositionLabel: string;
    lastActivityLabel: string;
    loadsWithoutReceiverLabel: string;
    activeTourNoLoads: string;
    noActivity: string;
    currentCargoLabel: string;
    targetPlaceLabel: string;
    loadDestinationsLabel: string;
    noActiveTour: string;
    noPosition: string;
}

export interface FriendsInterface {
    en: Entries;
    pl: Entries;
}
