import React, {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useReducer,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { v4 as uuidV4 } from "uuid";
import Peer, { MediaConnection } from "peerjs";
import { peersReducer } from "./peersReducer";
import {
  addPeerAction,
  removePeerAction,
  resetPeersAction,
  updatePeerAction
} from "./peerActions";
import { useAuth } from "./AuthContext";

const WS_SERVER = import.meta.env.VITE_WS_SERVER || "http://localhost:8000";

interface IChatMessage {
  roomId: string;
  senderId: string;
  message: string;
  timestamp: number;
  name?: string;
  reaction?: string;
}

type PeerConnection = {
  peerId: string;
  call: MediaConnection;
};

interface RoomContextType {
    socket: Socket | null;
    peer: Peer | null;
    stream: MediaStream | null;
    peers: Record<string, { stream: MediaStream; isSharingScreen?: boolean }>;
    isScreenSharing: boolean;
    roomId: string;
    setRoomId: (roomId: string) => void;
    shareScreen: () => Promise<void>;
    stopScreenShare: () => void;
    messages: IChatMessage[];
    sendMessage: (message: string) => void;
    isChatOpen: boolean;
    toggleChat: () => void;
    unreadMessages: number;
    setUnreadMessages: React.Dispatch<React.SetStateAction<number>>;
    isVideoEnabled: boolean;
    toggleVideo: () => void;
    isAudioEnabled: boolean;
    toggleAudio: () => void;
    endCall: () => void;
    connectionState: "connecting" | "connected" | "disconnected";
    currentUser: {
      uid: string;
      displayName: string | null;
      photoURL: string | null;
    } | null;
  }
export const RoomContext = createContext<RoomContextType>(
  {} as RoomContextType
);

type RoomProviderProps = {
  children: ReactNode;
};

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [peers, dispatch] = useReducer(peersReducer, {});
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [roomId, setRoomIdState] = useState("");
  const [activeConnections, setActiveConnections] = useState<PeerConnection[]>(
    []
  );
  const [connectionState, setConnectionState] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");
  const navigate = useNavigate();
  const [messages, setMessages] = useState<IChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const { currentUser } = useAuth();

  const socket = useMemo(() => io(WS_SERVER), []);

  const cleanupMediaStream = useCallback((mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
        try {
          mediaStream.removeTrack(track);
        } catch (e) {
          console.warn("Error removing track:", e);
        }
      });
    }
  }, []);

  const getMediaStream = useCallback(
    async (constraints: MediaStreamConstraints) => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
      } catch (error) {
        console.error("Error getting media stream:", error);
        throw error;
      }
    },
    []
  );

  const setupPeer = useCallback(() => {
    const peerId = uuidV4();
    const newPeer = new Peer(peerId);

    newPeer.on("open", () => {
      console.log("Peer connection opened with ID:", peerId);
      setPeer(newPeer);
      setConnectionState("connected");
    });

    newPeer.on("error", (error) => {
      console.error("Peer error:", error);
      setConnectionState("disconnected");
    });

    newPeer.on("disconnected", () => {
      setConnectionState("disconnected");
    });

    return newPeer;
  }, []);

  const endCall = useCallback(() => {
    if (!socket || !peer || !roomId) return;

    setConnectionState("disconnected");

    activeConnections.forEach(({ call }) => {
      try {
        call.close();
      } catch (e) {
        console.warn("Error closing call:", e);
      }
    });

    if (stream) {
      cleanupMediaStream(stream);
    }

    socket.emit("leave-room", { roomId, peerId: peer.id });

    try {
      peer.destroy();
    } catch (e) {
      console.warn("Error destroying peer:", e);
    }

    // Reset state
    setPeer(null);
    setStream(null);
    dispatch(resetPeersAction());
    setActiveConnections([]);
    setIsScreenSharing(false);
    setMessages([]);

    // Reinitialize peer to allow new meetings
    const newPeer = setupPeer();
    setPeer(newPeer);

    navigate("/");
  }, [
    socket,
    peer,
    roomId,
    stream,
    activeConnections,
    cleanupMediaStream,
    navigate,
    setupPeer,
  ]);

  const handleUserJoined = useCallback(
    ({ peerId }: { peerId: string }) => {
      if (!peer || !stream) return;

      try {
        const call = peer.call(peerId, stream);
        console.log("Calling peer:", peerId);

        call.on("stream", (peerStream: MediaStream) => {
          console.log("Received stream from:", peerId);
          dispatch(addPeerAction(peerId, peerStream));
        });

        call.on("close", () => {
          console.log("Call closed with:", peerId);
          dispatch(removePeerAction(peerId));
        });

        call.on("error", (error) => {
          console.error("Call error:", error);
          dispatch(removePeerAction(peerId));
        });

        setActiveConnections((prev) => [...prev, { peerId, call }]);
      } catch (error) {
        console.error("Error calling peer:", error);
      }
    },
    [peer, stream]
  );

  const handleIncomingCall = useCallback(
    (call: MediaConnection) => {
      if (!stream) return;

      console.log("Answering call from:", call.peer);

      try {
        call.answer(stream);

        call.on("stream", (peerStream: MediaStream) => {
          console.log("Received stream during call from:", call.peer);
          dispatch(addPeerAction(call.peer, peerStream));
        });

        call.on("close", () => {
          console.log("Incoming call closed from:", call.peer);
          dispatch(removePeerAction(call.peer));
        });

        call.on("error", (error) => {
          console.error("Incoming call error:", error);
          dispatch(removePeerAction(call.peer));
        });

        setActiveConnections((prev) => [...prev, { peerId: call.peer, call }]);
      } catch (error) {
        console.error("Error answering call:", error);
      }
    },
    [stream]
  );
// Update the stopScreenShare function
const stopScreenShare = useCallback(async () => {
  if (!peer || !stream) return;

  try {
    const userStream = await getMediaStream({
      video: isVideoEnabled,
      audio: isAudioEnabled,
    });

    // Replace tracks back to camera
    activeConnections.forEach(({ call }) => {
      const videoTrack = userStream.getVideoTracks()[0];
      const senders = call.peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === "video");
      if (videoSender) {
        videoSender.replaceTrack(videoTrack).catch(console.error);
      }
    });

    // Update state
    setStream(userStream);
    setIsScreenSharing(false);
    socket?.emit("stop-screen-share", { roomId, peerId: peer.id });

    // Update our own peer state
    dispatch(updatePeerAction(peer.id, false));

    // Clean up screen stream
    stream.getTracks().forEach(track => track.stop());

  } catch (error) {
    console.error("Error stopping screen share:", error);
  }
}, [peer, stream, activeConnections, socket, getMediaStream, isVideoEnabled, isAudioEnabled, roomId]);

// Update the shareScreen function
const shareScreen = useCallback(async () => {
  if (!peer || !stream) return;

  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    // Replace all video tracks in existing connections
    activeConnections.forEach(({ call }) => {
      const videoTrack = screenStream.getVideoTracks()[0];
      const senders = call.peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === "video");
      if (videoSender) {
        videoSender.replaceTrack(videoTrack).catch(console.error);
      }
    });

    // Update state
    setStream(screenStream);
    setIsScreenSharing(true);
    socket?.emit("start-screen-share", { roomId, peerId: peer.id });

    // Update our own peer state
    dispatch(updatePeerAction(peer.id, true));

    // Handle when user stops sharing via browser UI
    screenStream.getVideoTracks()[0].onended = () => {
      stopScreenShare();
    };

  } catch (error) {
    console.error("Error sharing screen:", error);
  }
}, [peer, stream, activeConnections, socket, stopScreenShare, roomId]);


  const toggleVideo = useCallback(async () => {
    if (!stream) return;

    const newState = !isVideoEnabled;
    setIsVideoEnabled(newState);

    stream.getVideoTracks().forEach((track) => {
      track.enabled = newState;
    });

    activeConnections.forEach(({ call }) => {
      const senders = call.peerConnection.getSenders();
      const videoSender = senders.find((s) => s.track?.kind === "video");
      if (videoSender && videoSender.track) {
        videoSender.track.enabled = newState;
      }
    });

    socket?.emit("video-toggle", { peerId: peer?.id, enabled: newState });
  }, [stream, isVideoEnabled, activeConnections, socket, peer]);

  const toggleAudio = useCallback(async () => {
    if (!stream) return;

    const newState = !isAudioEnabled;
    setIsAudioEnabled(newState);

    stream.getAudioTracks().forEach((track) => {
      track.enabled = newState;
    });

    activeConnections.forEach(({ call }) => {
      const senders = call.peerConnection.getSenders();
      const audioSender = senders.find((s) => s.track?.kind === "audio");
      if (audioSender && audioSender.track) {
        audioSender.track.enabled = newState;
      }
    });

    socket?.emit("audio-toggle", { peerId: peer?.id, enabled: newState });
  }, [stream, isAudioEnabled, activeConnections, socket, peer]);

  const sendMessage = useCallback((message: string) => {
    if (!socket || !peer || !roomId || !currentUser) return;

      socket.emit("send-message", {
        roomId,
        senderId: peer.id,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userAvatar: currentUser.photoURL,
        message,
      });
    },
    [socket, peer, roomId, currentUser]
  );

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) {
        setUnreadMessages(0);
      }
      return !prev;
    });
  }, []);

  const setRoomId = useCallback((id: string) => {
    setRoomIdState(id);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: IChatMessage) => {
      setMessages((prev) => [...prev, msg]);
      if (!isChatOpen) {
        setUnreadMessages((prev) => prev + 1);
      }
    };

    const handleReceiveMessages = ({
      messages,
    }: {
      messages: IChatMessage[];
    }) => {
      setMessages(messages);
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("receive-messages", handleReceiveMessages);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("receive-messages", handleReceiveMessages);
    };
  }, [socket, isChatOpen]);

  useEffect(() => {
    if (!socket || !roomId) return;
    socket.emit("request-messages", { roomId });
  }, [socket, roomId]);

  useEffect(() => {
    const newPeer = setupPeer();
    return () => {
      if (newPeer && !newPeer.destroyed) {
        newPeer.destroy();
      }
    };
  }, [setupPeer]);

  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const initializeMediaStream = async () => {
      try {
        mediaStream = await getMediaStream({ video: true, audio: true });
        setStream(mediaStream);
      } catch (error) {
        console.error("Failed to initialize media stream:", error);
      }
    };

    initializeMediaStream();

    return () => {
      if (mediaStream) {
        cleanupMediaStream(mediaStream);
      }
    };
  }, [getMediaStream, cleanupMediaStream]);

  useEffect(() => {
    if (!socket || !peer) return;

    const handleRoomCreated = ({ roomId }: { roomId: string }) => {
      navigate(`/room/${roomId}`);
    };

    const handleUserDisconnected = (peerId: string) => {
      dispatch(removePeerAction(peerId));
      setActiveConnections((prev) =>
        prev.filter((conn) => conn.peerId !== peerId)
      );
    };

    socket.on("room-created", handleRoomCreated);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-disconnected", handleUserDisconnected);

    peer.on("call", handleIncomingCall);

    return () => {
      socket.off("room-created", handleRoomCreated);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-disconnected", handleUserDisconnected);
      peer.off("call", handleIncomingCall);
    };
  }, [socket, peer, navigate, handleUserJoined, handleIncomingCall]);

  const contextValue = useMemo(
    () => ({
      socket,
      peer,
      stream,
      peers,
      isScreenSharing,
      roomId,
      setRoomId,
      shareScreen,
      stopScreenShare,
      messages,
      sendMessage,
      isChatOpen,
      toggleChat,
      unreadMessages,
      setUnreadMessages,
      isVideoEnabled,
      toggleVideo,
      isAudioEnabled,
      toggleAudio,
      endCall,
      connectionState,
      currentUser,
    }),
    [
      socket,
      peer,
      stream,
      peers,
      isScreenSharing,
      roomId,
      setRoomId,
      shareScreen,
      stopScreenShare,
      messages,
      sendMessage,
      isChatOpen,
      toggleChat,
      unreadMessages,
      isVideoEnabled,
      toggleVideo,
      isAudioEnabled,
      toggleAudio,
      endCall,
      connectionState,
      currentUser,
    ]
  );

  return (
    <RoomContext.Provider value={contextValue}>{children}</RoomContext.Provider>
  );
};
