import { useContext } from "react";
import { RoomContext } from "../context/RoomContext";

export const CreateButton: React.FC = () => {
  const roomContext = useContext(RoomContext); // Safely access RoomContext

  const createRoom = () => {
    if (!roomContext) {
      console.error("RoomContext is not available!");
      return;
    }

    const { socket } = roomContext;

    if (socket) {
      socket.emit("create-room");
      console.log("Emitted 'create-room' event to the server.");
    } else {
      console.error("Socket is not initialized.");
    }
  };

  return (
    <button className="primary-button large" onClick={createRoom}>
    <span className="material-icons">video_call</span>
    <span className="button-text">New meeting</span>
  </button>
  );
};
