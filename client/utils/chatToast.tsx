import { useStore } from "@/store/useStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


interface User {
    id: number;
    username: string;
    avatarurl: string;
}
export const chatToast = ({
  sender,
  content,
  closeToast,
}: {
  sender: User;
  content: string;
  closeToast: () => void;
}) => {
  const navigate = useNavigate();
  const { setSelectedUser } = useStore();

  useEffect(() => {
    setSelectedUser(sender);
  }, [sender]);

  const navToChat = () => {
    navigate("/chat");
    closeToast();
  };

  return (
    <div className="flex justify-between items-center w-full">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <img
            src={sender.avatarurl}
            alt="Avatar"
            className="size-12 rounded-full mr-2"
          />
          <div className="flex flex-col justify-start">
            <span className="font-semibold">{sender.username}</span>
            <span className="text-white/80 text-[14px]">
              {content.length > 10 ? content.substring(0, 10) + "..." : content}
            </span>
          </div>
        </div>
        <button onClick={navToChat}>
          <span className="text-white bg-yellow_3 hover:bg-yellow_4/80 px-3 py-2 rounded">
            view
          </span>
        </button>
      </div>
    </div>
  );
};
