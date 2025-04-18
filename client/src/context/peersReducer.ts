import { PeerAction, ADD_PEER, REMOVE_PEER, RESET_PEERS } from "./peerActions";

export type PeerState = Record<
    string, 
    { 
        stream: MediaStream; 
        isSharingScreen?: boolean 
    }
>;

// In peersReducer.ts
export const peersReducer = (
    state: PeerState,
    action: PeerAction
  ): PeerState => {
    switch (action.type) {
      case "ADD_PEER":
        return {
          ...state,
          [action.payload.peerId]: {
            stream: action.payload.stream,
            isSharingScreen: action.payload.isSharingScreen || false,
          },
        };
      case "REMOVE_PEER":
        const { [action.payload.peerId]: _, ...rest } = state;
        return rest;
      case "UPDATE_PEER":
        return {
          ...state,
          [action.payload.peerId]: {
            ...state[action.payload.peerId],
            isSharingScreen: action.payload.isSharingScreen,
          },
        };
      case "RESET_PEERS":
        return {};
      default:
        return state;
    }
  };
  
