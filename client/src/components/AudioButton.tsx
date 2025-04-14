import { FC } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import './AudioButton.css';

interface AudioButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
}

export const AudioButton: FC<AudioButtonProps> = ({
  isEnabled,
  onToggle,
}) => {
  return (
    <button
      className={`audio-button ${isEnabled ? "enabled" : "disabled"}`}
      onClick={onToggle}
      aria-label={isEnabled ? "Mute microphone" : "Unmute microphone"}
    >
      {isEnabled ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
    </button>
  );
};