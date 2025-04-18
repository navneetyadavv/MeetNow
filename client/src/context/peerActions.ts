export const ADD_PEER = "ADD_PEER" as const;
export const REMOVE_PEER = "REMOVE_PEER" as const;
export const RESET_PEERS = "RESET_PEERS" as const;
export const UPDATE_PEER = "UPDATE_PEER" as const;  // Added this new action type

export type AddPeerAction = {
    type: typeof ADD_PEER;
    payload: {
        peerId: string;
        stream: MediaStream;
        isSharingScreen?: boolean;
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

export type UpdatePeerAction = {  // Added this new action type
    type: typeof UPDATE_PEER;
    payload: {
        peerId: string;
        isSharingScreen: boolean;
    };
};

export type PeerAction = 
    | AddPeerAction 
    | RemovePeerAction 
    | ResetPeersAction
    | UpdatePeerAction;  // Added to the union type

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

export const updatePeerAction = (  // Added this new action creator
    peerId: string,
    isSharingScreen: boolean
): UpdatePeerAction => ({
    type: UPDATE_PEER,
    payload: { peerId, isSharingScreen }
});