import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { RoomContext } from "../context/RoomContext";
import VideoPlayer from "../components/VideoPlayer";
import ShareScreenButton from "../components/ShareScreenButton";
import { ChatButton } from "../components/ChatButton";
import { ChatPanel } from "../components/ChatPanel";
import { VideoButton } from "../components/VideoButton";
import { AudioButton } from "../components/AudioButton";
import { EndCallButton } from "../components/EndCallButton";
import { useNavigate } from "react-router-dom";
import "./Room.css";
import "./Chat.css";

const Room = () => {
  const navigate = useNavigate();
  const { id: roomId } = useParams<{ id: string }>();
  const [meetingTime, setMeetingTime] = useState("00:00:00");
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 600);

  const {
    socket,
    peer,
    stream,
    peers,
    isScreenSharing,
    shareScreen,
    stopScreenShare,
    setRoomId,
    isVideoEnabled,
    toggleVideo,
    isAudioEnabled,
    toggleAudio,
    endCall,
    currentUser,
    isChatOpen,
    toggleChat,
  } = useContext(RoomContext);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Timer effect
  useEffect(() => {
    const startTime = new Date();
    const timer = setInterval(() => {
      const now = new Date();
      const diff = new Date(now.getTime() - startTime.getTime());
      const hours = diff.getUTCHours().toString().padStart(2, "0");
      const minutes = diff.getUTCMinutes().toString().padStart(2, "0");
      const seconds = diff.getUTCSeconds().toString().padStart(2, "0");
      setMeetingTime(`${hours}:${minutes}:${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Room joining
  useEffect(() => {
    if (roomId) setRoomId(roomId);
  }, [roomId, setRoomId]);

  useEffect(() => {
    if (!socket || !peer || !roomId || !currentUser) return;

    socket.emit("join-room", {
      roomId,
      peerId: peer.id,
      userId: currentUser.uid,
      userName: currentUser.displayName,
    });
  }, [socket, peer, roomId, currentUser]);

  // Active speaker detection
  useEffect(() => {
    if (!stream && Object.keys(peers).length === 0) return;

    const timeout = setTimeout(() => {
      if (isScreenSharing) {
        setActiveSpeaker("screenshare");
      } else if (Object.keys(peers).length > 0) {
        setActiveSpeaker(Object.keys(peers)[0]);
      } else {
        setActiveSpeaker(null);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [peers, isScreenSharing, stream]);

  const screenSharingStream = isScreenSharing ? stream : null;
  const otherPeers = Object.entries(peers);

  const isAnyoneSharing =
    isScreenSharing ||
    otherPeers.some(([_, { isSharingScreen }]) => isSharingScreen === true);

  const remoteScreenSharingPeer = otherPeers.find(
    ([_, { isSharingScreen }]) => isSharingScreen === true
  );
  const remoteScreenSharingStream = remoteScreenSharingPeer?.[1]?.stream;

  const videoParticipants = otherPeers.filter(
    ([_, { isSharingScreen }]) => !isSharingScreen
  );

  const getLayoutClass = () => {
    if (isAnyoneSharing) return "screenshare-active";
    const totalParticipants = videoParticipants.length + (stream ? 1 : 0);
    if (totalParticipants <= 2) return "few-participants";
    if (totalParticipants <= 4) return "medium-participants";
    return "many-participants";
  };

  useEffect(() => {
    if (!socket || !peer || !roomId) return;

    const handleRoomFull = () => {
      alert("This meeting is full. Please try again later.");
      navigate("/");
    };

    const handleInvalidRoom = () => {
      alert("Invalid meeting code. Please check and try again.");
      navigate("/");
    };

    socket.on("room-full", handleRoomFull);
    socket.on("invalid-room", handleInvalidRoom);

    return () => {
      socket.off("room-full", handleRoomFull);
      socket.off("invalid-room", handleInvalidRoom);
    };
  }, [socket, peer, roomId, navigate]);

  return (
    <div className={`meet-container ${isChatOpen ? "chat-open" : ""}`}>
      {/* Main meeting area */}
      <div className={`meet-content ${getLayoutClass()}`}>
        {/* Screen sharing view */}
        {isAnyoneSharing && (
          <div className="screenshare-container">
            {isScreenSharing ? (
              <VideoPlayer stream={stream} isScreenShare={true} userId="You" />
            ) : remoteScreenSharingPeer ? (
              <VideoPlayer
                stream={remoteScreenSharingPeer[1].stream}
                isScreenShare={true}
                userId={remoteScreenSharingPeer[0]}
              />
            ) : null}
          </div>
        )}

        {/* Participants area */}
        <div className="participants-container">
          {/* Current user - only show if not screen sharing */}
          {stream && !isScreenSharing && (
            <div
              className={`participant-tile current-user ${
                activeSpeaker === peer?.id ? "active-speaker" : ""
              }`}
            >
              <VideoPlayer
                stream={stream}
                isCurrentUser
                userId="You"
                showInfoBar={true}
              />
            </div>
          )}

          {/* Other participants */}
          {videoParticipants.map(
            ([peerId, { stream, isSharingScreen }]) =>
              !isSharingScreen && (
                <div
                  key={peerId}
                  className={`participant-tile ${
                    activeSpeaker === peerId ? "active-speaker" : ""
                  }`}
                >
                  <VideoPlayer
                    stream={stream}
                    userId={peerId}
                    showInfoBar={true}
                  />
                </div>
              )
          )}
        </div>
      </div>

      {/* Controls bar */}
      <div className="meet-controls-bar">
        <div className="left-controls">
          <div className="meeting-time-display">
            <span className="time">{meetingTime}</span>
          </div>
        </div>

        <div className="center-controls">
          <AudioButton isEnabled={isAudioEnabled} onToggle={toggleAudio} />
          <VideoButton isEnabled={isVideoEnabled} onToggle={toggleVideo} />
          <ShareScreenButton
            isScreenSharing={isScreenSharing}
            onShareScreen={shareScreen}
            onStopSharing={stopScreenShare}
          />
          <EndCallButton onEndCall={endCall} />
        </div>

        <div className="right-controls">
          <button className="control-button participants-control">
            <span className="icon">👥</span>
            {!isMobileView && <span>Participants</span>}
          </button>
          <ChatButton isOpen={isChatOpen} onToggle={toggleChat} />
        </div>
      </div>

      <ChatPanel isMobileView={isMobileView} />
    </div>
  );
};

export default Room;