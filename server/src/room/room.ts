import { Socket, Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

interface IChatMessage {
  roomId: string;
  senderId: string;
  userId: string;
  message: string;
  timestamp: number;
  name?: string;
  photoURL?: string;
  reaction?: string;
}

interface RoomMember {
  peerId: string;
  userId: string; // Required
  userName?: string; // Optional
  userAvatar?: string; // Optional
}

interface IRoomParams {
  roomId: string;
  peerId: string;
  userId?: string; // Made optional with ?
  userName?: string;
  userAvatar?: string;
}
// Store these outside the handler so they persist
const rooms: Record<string, RoomMember[]> = {};
const chatHistory: Record<string, IChatMessage[]> = {};
const MAX_ROOM_SIZE = 100;

export const roomHandler = (socket: Socket, io: Server) => {
  const sendMessage = ({
    roomId,
    senderId,
    userId,
    userName,
    userAvatar,
    message,
  }: Omit<IChatMessage, "timestamp"> & {
    userId: string;
    userName?: string;
    userAvatar?: string;
  }) => {
    const msg: IChatMessage = {
      roomId,
      senderId,
      userId,
      message,
      name: userName || senderId.slice(0, 8),
      photoURL: userAvatar,
      timestamp: Date.now(),
    };

    if (!chatHistory[roomId]) {
      chatHistory[roomId] = [];
    }

    chatHistory[roomId].push(msg);
    io.to(roomId).emit("receive-message", msg);
  };

  const getMessages = (roomId: string) => {
    return chatHistory[roomId] || [];
  };

  const createRoom = () => {
    const roomId = uuidv4();
    rooms[roomId] = [];
    console.log(`Room created: ${roomId}`);
    socket.emit("room-created", { roomId });
  };

  const startSharing = ({ peerId, roomId }: IRoomParams) => {
    console.log(`User ${peerId} started sharing in room ${roomId}`);
    socket.to(roomId).emit("user-started-sharing", { peerId });
  };

  const stopSharing = ({ peerId, roomId }: IRoomParams) => {
    console.log(`User ${peerId} stopped sharing in room ${roomId}`);
    socket.to(roomId).emit("user-stopped-sharing", { peerId });
  };

  const leaveRoom = ({ peerId, roomId }: IRoomParams) => {
    if (rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter(
        (member) => member.peerId !== peerId
      );
      socket.to(roomId).emit("user-disconnected", peerId);

      if (rooms[roomId].length === 0) {
        delete rooms[roomId];
        delete chatHistory[roomId];
        console.log(`Room ${roomId} deleted as it became empty`);
      }
    }
  };
  const joinRoom = ({
    roomId,
    peerId,
    userId,
    userName,
    userAvatar,
  }: IRoomParams) => {
    if (!userId) {
      console.error("User ID is required");
      return;
    }

    if (!rooms[roomId]) {
      // Create room if it doesn't exist (for the first joiner)
      rooms[roomId] = [];
    }

    if (rooms[roomId].length >= MAX_ROOM_SIZE) {
      console.error(`Room ${roomId} is full`);
      socket.emit("room-full");
      return;
    }

    // Notify existing users about the new user
    socket.to(roomId).emit("user-joined", { peerId });
    // Check if this user is already in the room (by userId, not peerId)
    const existingUserIndex = rooms[roomId].findIndex(
      (member) => member.userId === userId
    );
    if (existingUserIndex !== -1) {
      // Update the existing user's peerId and socket connection
      rooms[roomId][existingUserIndex].peerId = peerId;
      console.log(`User reconnected: ${userId} with new peerId ${peerId}`);
    } else {
      // Add new user
      rooms[roomId].push({ peerId, userId, userName, userAvatar });
      console.log(`New user joined: ${userId} with peerId ${peerId}`);
    }

    socket.join(roomId);

    // Notify all clients in the room about the updated user list
    io.to(roomId).emit("get-users", {
      roomId,
      participants: rooms[roomId],
    });
  };

  // Socket event listeners
  socket.on("react-to-message", ({ messageId, reaction, roomId }) => {
    const roomMessages = chatHistory[roomId];
    if (!roomMessages) return;

    const messageIndex = roomMessages.findIndex(
      (msg) => msg.timestamp === messageId
    );
    if (messageIndex !== -1) {
      const updatedMessage = {
        ...roomMessages[messageIndex],
        reaction,
      };

      chatHistory[roomId][messageIndex] = updatedMessage;
      io.to(roomId).emit("message-updated", updatedMessage);
    }
  });

  socket.on("join-room", joinRoom);
  socket.on("send-message", sendMessage);
  socket.on("request-messages", ({ roomId }) => {
    socket.emit("receive-messages", { messages: getMessages(roomId) });
  });
  socket.on("create-room", createRoom);
  socket.on("start-screen-share", (data) => startSharing(data));
  socket.on("stop-screen-share", (data) => stopSharing(data));
  socket.on("leave-room", leaveRoom);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
    // Find and remove this socket from all rooms
    Object.entries(rooms).forEach(([roomId, members]) => {
      const member = members.find((m) => m.peerId === socket.id);
      if (member) {
        leaveRoom({ peerId: socket.id, roomId });
      }
    });
  });
};
