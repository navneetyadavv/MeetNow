import { useEffect, useRef, useState } from "react";
import "./VideoPlayer.css";

interface VideoPlayerProps {
  stream: MediaStream | null | undefined;
  isCurrentUser?: boolean;
  userId: string;
  isScreenShare?: boolean;
  isDominantSpeaker?: boolean;
  isAudioEnabled?: boolean;
  isVideoEnabled?: boolean;
  className?: string;
  showInfoBar?: boolean;
  userName?: string;
  userAvatar?: string;
}

const VideoPlayer = ({
  stream,
  userId,
  isCurrentUser = false,
  isScreenShare = false,
  isDominantSpeaker = false,
  isAudioEnabled = true,
  isVideoEnabled = true,
  className = "",
  showInfoBar = true,
  userName,
  userAvatar,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideoTracks, setHasVideoTracks] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    if (!videoRef.current) return;

    const videoElement = videoRef.current;

    if (stream) {
      videoElement.srcObject = stream;

      const videoTracks = stream.getVideoTracks();
      const hasVideo = videoTracks.length > 0 && videoTracks[0].enabled;
      setHasVideoTracks(hasVideo);

      if (!isCurrentUser && isAudioEnabled) {
        const audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 32;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const checkSpeaking = () => {
          analyser.getByteFrequencyData(dataArray);
          const average =
            Array.from(dataArray).reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(Math.min(average / 255, 1));
          setIsSpeaking(average > 10);
          requestAnimationFrame(checkSpeaking);
        };

        checkSpeaking();

        return () => {
          source.disconnect();
          audioContext.close();
        };
      }
    } else {
      videoElement.srcObject = null;
      setHasVideoTracks(false);
    }
  }, [stream, isCurrentUser, isAudioEnabled]);

  const showVideo = hasVideoTracks && isVideoEnabled && !isScreenShare;
  const userInitial = userId.charAt(0).toUpperCase();
  const displayName = isCurrentUser ? "You" : userId.split(" ")[0];

  return (
    <div
      className={`video-player ${className} ${
        isScreenShare ? "screen-share" : ""
      } 
            ${isDominantSpeaker ? "dominant-speaker" : ""} ${
        isSpeaking ? "speaking" : ""
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isCurrentUser}
        className={`${isCurrentUser ? "mirror" : ""} ${
          !showVideo ? "hidden" : ""
        }`}
      />
     <div className="video-info">
        {userAvatar ? (
          <img src={userAvatar} alt={userName || userId} className="user-avatar" />
        ) : (
          <div className="avatar-placeholder">{userName?.charAt(0) || userId.charAt(0)}</div>
        )}
        <span className="user-name">
          {isCurrentUser ? "You" : userName || userId}
        </span>
        {isScreenShare && <span className="screen-share-badge">Screen</span>}
      </div>
    </div>
  );
};

export default VideoPlayer;
