import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

// Define the rooms and chat history outside of the roomHandler function
const rooms: Record<string, string[]> = {};
const chatHistory: Record<string, IChatMessage[]> = {};

interface IChatMessage {
  roomId: string;
  senderId: string;
  message: string;
  timestamp: number;
  name?: string;
  reaction?: string; // Add this line
}
interface IRoomParams {
  roomId: string;
  peerId: string;
}
export const roomHandler = (socket: Socket, io: Server) => {
  interface IRoomParams {
    roomId: string;
    peerId: string;
  }
  const MAX_ROOM_SIZE = 100; // Set your max room size

  // Add chat message handling
  const sendMessage = ({
    roomId,
    senderId,
    message,
    name,
  }: Omit<IChatMessage, "timestamp">) => {
    const msg: IChatMessage = {
      roomId,
      senderId,
      message,
      timestamp: Date.now(),
      name: name || senderId.slice(0, 8),
    };

    if (!chatHistory[roomId]) {
      chatHistory[roomId] = [];
    }

    chatHistory[roomId].push(msg);
    io.to(roomId).emit("receive-message", msg); // Use the passed io instance
  };

  const getMessages = (roomId: string) => {
    return chatHistory[roomId] || [];
  };

  const createRoom = () => {
    console.log("room is created");
    const roomId = uuidv4();
    rooms[roomId] = [];
    socket.emit("room-created", { roomId });
    console.log("user created the room");
  };

  const startSharing = ({ peerId, roomId }: IRoomParams) => {
    socket.to(roomId).emit("user-started-sharing", peerId);
  };

  const stopSharing = (roomId: string) => {
    socket.to(roomId).emit("user-stopped-sharing");
  };

  const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
      socket.to(roomId).emit("user-disconnected", peerId);

      // If room is empty, clean it up
      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        delete chatHistory[roomId];
        console.log(`Room ${roomId} deleted as it became empty`);
      }
    }
  };

  const joinRoom = ({ roomId, peerId }: IRoomParams) => {
    console.log("Attempting to join room", roomId, "with peer", peerId);

    // Check if room exists and isn't full
    if (!rooms[roomId]) {
      console.log(`Room ${roomId} does not exist`);
      socket.emit("invalid-room");
      return;
    }

    if (rooms[roomId].length >= MAX_ROOM_SIZE) {
      console.log(`Room ${roomId} is full`);
      socket.emit("room-full");
      return;
    }

    // Check if the peerId already exists in the room
    if (!rooms[roomId].includes(peerId)) {
      console.log("User joined the room", roomId, peerId);
      rooms[roomId].push(peerId);
      console.log("room members", rooms[roomId]);
      socket.join(roomId);

      socket.to(roomId).emit("user-joined", { peerId });
      // Emit the updated list of participants to all users in the room
      socket.to(roomId).emit("get-users", {
        roomId,
        participants: rooms[roomId],
      });

      // Optionally, emit to the sender as well
      socket.emit("get-users", {
        roomId,
        participants: rooms[roomId],
      });
    } else {
      console.log("User already in the room", peerId);
    }

    socket.on("disconnect", () => {
      console.log("user left the room: ", peerId);
      leaveRoom({ peerId, roomId });
    });
  };

  socket.on("react-to-message", ({ messageId, reaction, roomId }) => {
    const roomMessages = chatHistory[roomId];
    if (!roomMessages) return;

    const messageIndex = roomMessages.findIndex(
      (msg) => msg.timestamp === messageId
    );
    if (messageIndex !== -1) {
      // Create a new object to ensure state updates
      const updatedMessage = {
        ...roomMessages[messageIndex],
        reaction,
      };

      chatHistory[roomId][messageIndex] = updatedMessage;
      io.to(roomId).emit("message-updated", updatedMessage);
    }
  });
  socket.on("join-room", joinRoom)
  socket.on("send-message", sendMessage);
  socket.on("request-messages", ({ roomId }) => {
    socket.emit("receive-messages", { messages: getMessages(roomId) });
  });
  socket.on("create-room", createRoom);
  socket.on("start-sharing", startSharing);
  socket.on("stop-sharing", stopSharing);
  socket.on("leave-room", leaveRoom);
};
