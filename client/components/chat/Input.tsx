import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import send from "../../../public/assests/send.png";
import { Smile } from "lucide-react";
import { EmojiPicker } from "./EmojiPicker";

interface Message {
  sender_id: number;
  receiver_id: number;
  content: string;
}

export const Input = ({ disabled }) => {
  const [newMessage, setNewMessage] = useState("");
  const { socket, user, selectedUser, addMessage } = useStore();
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const emojiRef = useRef(null);

  const onEmojiSelected = (emojiText) => {
    setNewMessage((prev) => prev + emojiText);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket && selectedUser && e.target.value.trim() !== "") {
      if (!isTypingRef.current) {
        socket.emit("istyping", { rid: selectedUser.id, sid: user.id });
        isTypingRef.current = true;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (socket && selectedUser) {
          socket.emit("stop_typing", { rid: selectedUser.id, sid: user.id });
          isTypingRef.current = false;
        }
      }, 2000);
    } else if (e.target.value.trim() === "" && isTypingRef.current) {
      if (socket && selectedUser) {
        socket.emit("stop_typing", { rid: selectedUser.id, sid: user.id });
        isTypingRef.current = false;
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleSendMessage = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (newMessage.trim() === "" || !socket || !user || !selectedUser) return;
    e.preventDefault();

    if (isTypingRef.current) {
      socket.emit("stop_typing", { rid: selectedUser.id, sid: user.id });
      isTypingRef.current = false;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const message: Message = {
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage,
    };
    socket.emit("send_message", message);

    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className=" bg-input_color rounded-[20px] w-full h-[52px] p-4">
      <div className="flex items-center  w-full h-full">
        <input
          disabled={disabled}
          onKeyDown={handleKeyDown}
          value={newMessage}
          onChange={handleInputChange}
          type="text"
          className={`${
            disabled ? "opacity-50" : ""
          } placeholder-[#D1D1D1] w-full focus:outline-none bg-transparent`}
          placeholder={`${disabled ? "disabled" : "your message"}`}
        />

        <div className="flex items-center justify-center ">
          <div className="flex items-center gap-1">
            <div ref={emojiRef} className="flex items-center">
              <div className={`flex items-center justify-center size-[42px] rounded-full ${!disabled && "hover:bg-gray_3"}`}>
                <button
                  onClick={() => setShowPicker((val) => !val)}
                  className={`flex-shrink-0  ${disabled ? "opacity-50" : ""}`}
                  disabled={disabled}
                >
                  <Smile
                    className="shrink-0 text-white/80"
                    size={28}
                    strokeWidth={1.4}
                    />
                    </button>
              </div>
                {showPicker && (
                  <div className="absolute bottom-16 right-16">
                    <EmojiPicker onEmojiSelected={onEmojiSelected} />
                  </div>
                )}
            </div>
            <div className={`flex items-center justify-center size-[42px] rounded-full ${!disabled && "hover:bg-gray_3"}`}>
              <button
                onClick={handleSendMessage}
                className={`flex-shrink-0   ${disabled ? "opacity-50" : ""}`}
                disabled={disabled}
              >
                <img src={send} alt="send" className="size-[29px]" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
