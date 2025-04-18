import { FC, useState, useRef, useEffect, useContext } from "react";
import { RoomContext } from "../context/RoomContext";
import { BsArrowLeft, BsEmojiSmile } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatPanelProps {
  isMobileView: boolean;
}

export const ChatPanel: FC<ChatPanelProps> = ({ isMobileView }) => {
  const { messages, sendMessage, isChatOpen, toggleChat } =
    useContext(RoomContext);
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
      setShowEmojiPicker(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest(".emoji-button")
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isChatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`chat-panel ${isMobileView ? "mobile" : ""}`}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
      >
        <div className="chat-header">
          <button onClick={toggleChat} className="close-chat">
            <BsArrowLeft size={18} />
          </button>
          <h3>Meeting Chat</h3>
        </div>
        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.map((msg, index) => (
            <div key={index} className="message">
              <div className="message-sender">
                {msg.name || msg.senderId.slice(0, 8)}
              </div>
              <div className="message-content">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input">
          <div ref={emojiPickerRef} className="emoji-picker-container">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="emoji-button"
            >
              <BsEmojiSmile size={20} />
            </button>
            {showEmojiPicker && (
              <motion.div
                className="emoji-picker"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <EmojiPicker
                  onEmojiClick={onEmojiClick}
                  width={300}
                  height={350}
                />
              </motion.div>
            )}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message to everyone"
            rows={1}
          />
          <button onClick={handleSendMessage} className="send-button">
            <IoSend size={20} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};