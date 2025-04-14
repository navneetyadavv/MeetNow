export const ADD_PEER = "ADD_PEER" as const;
export const REMOVE_PEER = "REMOVE_PEER" as const;
export const RESET_PEERS = "RESET_PEERS" as const;  // New action type

export type AddPeerAction = {
    type: typeof ADD_PEER;
    payload: {
        peerId: string;
        stream: MediaStream;
        isSharingScreen?: boolean;  // Optional field for screen sharing
    };
};

export type RemovePeerAction = {
    type: typeof REMOVE_PEER;
    payload: {
        peerId: string;
    };
};

export type ResetPeersAction = {
    type: typeof RESET_PEERS;
};

// Union type for all possible actions
export type PeerAction = AddPeerAction | RemovePeerAction | ResetPeersAction;

// Action creators
export const addPeerAction = (
    peerId: string, 
    stream: MediaStream,
    isSharingScreen?: boolean
): AddPeerAction => ({
    type: ADD_PEER,
    payload: { peerId, stream, isSharingScreen }
});

export const removePeerAction = (peerId: string): RemovePeerAction => ({
    type: REMOVE_PEER,
    payload: { peerId }
});

export const resetPeersAction = (): ResetPeersAction => ({
    type: RESET_PEERS
});