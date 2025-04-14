import { FC } from "react";
import { FaVideo, FaVideoSlash } from "react-icons/fa";
import { MdOutlineSettings } from "react-icons/md";
import './VideoButton.css'

interface VideoButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  onSettingsClick?: () => void;
}

export const VideoButton: FC<VideoButtonProps> = ({
  isEnabled,
  onToggle,
  onSettingsClick,
}) => {
  return (
    <div className="video-control-container">
      <button
        className={`video-button ${isEnabled ? "enabled" : "disabled"}`}
        onClick={onToggle}
        aria-label={isEnabled ? "Turn off camera" : "Turn on camera"}
      >
        {isEnabled ? <FaVideo size={20} /> : <FaVideoSlash size={20} />}
      </button>
      
      {isEnabled && (
        <button 
          className="video-settings-button"
          onClick={onSettingsClick}
          aria-label="Camera settings"
        >
          <MdOutlineSettings size={18} />
        </button>
      )}
    </div>
  );
};