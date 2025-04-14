import { PeerAction, ADD_PEER, REMOVE_PEER, RESET_PEERS } from "./peerActions";

export type PeerState = Record<
    string, 
    { 
        stream: MediaStream; 
        isSharingScreen?: boolean 
    }
>;

export const peersReducer = (state: PeerState, action: PeerAction) => {
    switch (action.type) {
        case ADD_PEER:
            return {
                ...state,
                [action.payload.peerId]: {
                    stream: action.payload.stream,
                    isSharingScreen: action.payload.isSharingScreen
                },
            };

        case REMOVE_PEER: {
            const newState = { ...state };
            delete newState[action.payload.peerId];
            return newState;
        }

        case RESET_PEERS:
            return {};

        default:
            return state;
    }
};