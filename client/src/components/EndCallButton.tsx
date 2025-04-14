import React from "react";
import "./EndCallButton.css";

interface EndCallButtonProps {
    onEndCall: () => void;
}

export const EndCallButton: React.FC<EndCallButtonProps> = ({ onEndCall }) => {
    return (
        <button className="google-meet-end-button" onClick={onEndCall}>
            <svg xmlns="http://www.w3.org/2000/svg" className="phone-icon" viewBox="0 0 24 24" width="24" height="24" fill="white">
    <path d="M6.6,10.8C8,13.6,10.4,16,13.2,17.4l2.2-2.2c0.3-0.3,0.7-0.4,1.1-0.3c1.2,0.4,2.5,0.6,3.9,0.6c0.6,0,1,0.4,1,1v3.6
        c0,0.6-0.4,1-1,1C10.8,21,3,13.2,3,3.9C3,3.4,3.4,3,3.9,3h3.6c0.6,0,1,0.4,1,1c0,1.4,0.2,2.7,0.6,3.9c0.1,0.4,0,0.8-0.3,1.1L6.6,10.8z"/>
</svg>

        </button>
    );
};
