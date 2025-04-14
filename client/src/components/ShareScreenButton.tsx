import { FC } from "react";
import { MdOutlinePresentToAll } from "react-icons/md";
import './ShareScreenButton.css'

type ShareScreenButtonProps = {
    isScreenSharing: boolean;
    onShareScreen: () => void;
    onStopSharing: () => void;
};

const ShareScreenButton: FC<ShareScreenButtonProps> = ({
    isScreenSharing,
    onShareScreen,
    onStopSharing,
}) => {
    return (
        <button
            onClick={isScreenSharing ? onStopSharing : onShareScreen}
            className={`screen-share-btn ${isScreenSharing ? "active" : ""}`}
        >
            {isScreenSharing ? <MdOutlinePresentToAll/> : <MdOutlinePresentToAll/>}
        </button>
    );
};

export default ShareScreenButton;