import { useAuth } from "@/hooks/useAuth";
import { useStore } from "@/store/useStore";
import api from "@/utils/Axios";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-toastify";

interface NotificationProps {
  setToggle: (value: boolean) => void;
  isToggle: boolean;
}

type invites = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  username: string;
  avatarurl: string;
};

export const Notification = ({ setToggle, isToggle }: NotificationProps) => {
  const [invitations, setInvitations] = useState<invites[]>([]);
  const { state, dispatch, setPersist } = useAuth();
  const { socket } = useStore();

  const handleAcceptRequest = (requester_id: string) => {
    if (socket && state.user) {
      socket.emit("accept_friend_request", {
        userId: state.user?.user.id,
        friendId: requester_id,
      });
    }
  };

  useEffect(() => {
    socket.on("friend_request_accepted", () => {
      console.log("Friend request accepted event received");
      // toast.success("Friend request accepted!");
    });

    return () => {
      if (socket) {
        socket.off("friend_request_accepted");
      }
    };
  }, [socket]);

  const requestedFriends = async () => {
    try {
      const { data } = await api.get(
        `/users/user/freindRequests/?id=${state.user?.user.id}`,
        {
          headers: {
            Authorization: `Bearer ${state.user?.accessToken}`,
          },
        }
      );
      console.log("requestedFriends:", data.friends);
      setInvitations(data.friends);
    } catch (err: any) {
      console.error("requestedFriends error:", err.message);
    }
  };

  useEffect(() => {
    requestedFriends();
    console.log(state.user);
  }, [state]);

  return (
    <div className="absolute right-[88px] flex min-h-0 z-40 justify-end">
      <div className="flex flex-col bg-gray_1 rounded-xl w-[400px] max-h-[400px]">
        <div className="flex justify-between items-center p-4 border-b border-gray-300">
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          <button
            onClick={() => setToggle(false)}
            className="text-gray-400 hover:text-white"
          >
            <X strokeWidth={2} />
          </button>
        </div>
        {invitations.length > 0 ? (
          <div className="flex-1 overflow-y-auto p-4">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between mb-4 p-2 bg-gray_2 rounded-lg"
              >
                <div className="flex items-center">
                  <img
                    src={invitation.avatarurl}
                    alt={invitation.username}
                    className="size-10 rounded-full mr-4"
                  />
                  <span className="text-white">{invitation.username}</span>
                </div>
                <div>
                  <button
                    onClick={() => handleAcceptRequest(invitation.requester_id)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg mr-2 hover:bg-green-600"
                  >
                    <Check strokeWidth={2} />
                  </button>
                  <button className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600">
                    <X strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <p className="text-gray-300">No new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};
