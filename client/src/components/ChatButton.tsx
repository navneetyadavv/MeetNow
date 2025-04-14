import { FC, useContext } from "react";
import { RoomContext } from "../context/RoomContext";
import { BsChatLeftTextFill } from "react-icons/bs";
import { FaRegCommentDots } from "react-icons/fa";
import { motion } from "framer-motion";

interface ChatButtonProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
}

export const ChatButton: FC<ChatButtonProps> = ({ 
    className = "", 
    size = 'md', 
    showLabel = false 
}) => {
    const { toggleChat, unreadMessages, isChatOpen } = useContext(RoomContext);
    
    const iconSize = {
        sm: 16,
        md: 20,
        lg: 24
    }[size];

    return (
        <button
            onClick={toggleChat}
            className={`chat-button ${className} ${isChatOpen ? 'active' : ''}`}
            aria-label={unreadMessages > 0 ? 
                `${unreadMessages} unread messages` : "Toggle chat"}
            aria-pressed={isChatOpen}
        >
            <div className="chat-button-inner">
                {unreadMessages > 0 ? (
                    <div className="chat-button-unread">
                        <FaRegCommentDots size={iconSize} />
                        {unreadMessages > 0 && (
                            <motion.span 
                                className="unread-count"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                key={unreadMessages}
                            >
                                {Math.min(unreadMessages, 99)}
                            </motion.span>
                        )}
                    </div>
                ) : (
                    <BsChatLeftTextFill size={iconSize} />
                )}
                {showLabel && (
                    <span className="chat-button-label">
                        Chat {unreadMessages > 0 && `(${unreadMessages})`}
                    </span>
                )}
            </div>
        </button>
    );
};