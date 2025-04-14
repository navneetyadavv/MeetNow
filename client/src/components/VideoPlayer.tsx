import { useEffect, useRef, useState } from "react";
import './VideoPlayer.css'

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
    showInfoBar = true
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasVideoTracks, setHasVideoTracks] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);

    useEffect(() => {
        if (!videoRef.current) return;

        const videoElement = videoRef.current;
        
        // Handle stream changes
        if (stream) {
            videoElement.srcObject = stream;
            
            // Check video tracks
            const videoTracks = stream.getVideoTracks();
            const hasVideo = videoTracks.length > 0 && videoTracks[0].enabled;
            setHasVideoTracks(hasVideo);

            // Handle audio level detection for speaking indicator
            if (!isCurrentUser && isAudioEnabled) {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaStreamSource(stream);
                source.connect(analyser);
                analyser.fftSize = 32;
                
                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);
                
                const checkSpeaking = () => {
                    analyser.getByteFrequencyData(dataArray);
                    const average = Array.from(dataArray).reduce((a, b) => a + b) / bufferLength;
                    setAudioLevel(Math.min(average / 255, 1)); // Normalize to 0-1
                    setIsSpeaking(average > 10); // Adjust threshold as needed
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
    const displayName = isCurrentUser ? "You" : userId.split(' ')[0]; // Show only first name

    return (
        <div className={`video-player ${className} ${isScreenShare ? "screen-share" : ""} 
            ${isDominantSpeaker ? "dominant-speaker" : ""} ${isSpeaking ? "speaking" : ""}`}>
            
            {/* Video element */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={isCurrentUser}
                className={`${isCurrentUser ? "mirror" : ""} ${!showVideo ? "hidden" : ""}`}
            />

            {/* Placeholder when video is off (Google Meet style) */}
            {(!showVideo || !stream) && (
                <div className="video-placeholder">
                    <div className="user-avatar" style={{ backgroundColor: stringToColor(userId) }}>
                        {userInitial}
                    </div>
                </div>
            )}

            {/* User information overlay (Google Meet style) */}
            {showInfoBar && (
                <div className="user-info">
                    <div className="audio-indicator" style={{ opacity: isSpeaking ? audioLevel : 0 }}></div>
                    <span className="user-name">
                        {displayName}
                        {!isAudioEnabled && <span className="mute-icon">🎤</span>}
                        {!isVideoEnabled && !isScreenShare && <span className="video-off-icon">🎥</span>}
                    </span>
                </div>
            )}

            {/* Current user indicator (Google Meet style) */}
            {isCurrentUser && showInfoBar && (
                <div className="current-user-indicator">You</div>
            )}

            {/* Screen share label */}
            {isScreenShare && showInfoBar && (
                <div className="screen-share-label">
                    {displayName}'s screen
                </div>
            )}
        </div>
    );
};

// Helper function to generate consistent color from string (Google's color palette)
function stringToColor(str: string) {
    const colors = [
        '#4285F4', // Google Blue
        '#34A853', // Google Green
        '#EA4335', // Google Red
        '#FBBC05', // Google Yellow
        '#673AB7', // Deep Purple
        '#FF5722', // Deep Orange
        '#009688', // Teal
        '#E91E63', // Pink
    ];
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default VideoPlayer;