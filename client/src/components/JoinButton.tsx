import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useContext } from "react";
export const JoinButton: React.FC = () => {
  const [meetingCode, setMeetingCode] = useState('')
  const navigate = useNavigate();
  const handleJoinMeeting = () => {
    if (meetingCode.trim()) {
      navigate(`/room/${ meetingCode.trim() }`);
    }
  }; const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinMeeting();
    }
  };

  return (
    <div className="input-container">
      <input
        type="text"
        placeholder="Enter a code or link"
        value={meetingCode}
        onChange={(e) => setMeetingCode(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button className="secondary-button" onClick={handleJoinMeeting}>Join</button>
    </div>
  );
};
