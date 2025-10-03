import { useEffect } from "react";
import { useStore } from "../../store/useStore";
import { queryClient } from "@/App";
import { Ban, MessageCircleWarning } from "lucide-react";
import { timeFormat } from "@/utils/chat/TimeFormat";
import { ChatSearch } from "./ChatSearch";
import { AnimatePresence, motion } from "motion/react";

interface User {
  id: number;
  username: string;
  avatarurl: string;
  status: string;
  last_seen: string;
}

interface dataProps {
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const ChatLeftSidebar = ({
  chatUsersData,
  typedUserId,
}: {
  chatUsersData: dataProps;
  typedUserId: number;
}) => {
  const { user, chatUsers, updateUser, selectedUser, setSelectedUser, socket } =
    useStore();

  useEffect(() => {
    const currentSelectedUser = localStorage.getItem("selectedUser");
    if (currentSelectedUser) {
      const parsedUser = JSON.parse(currentSelectedUser);
      if (parsedUser && parsedUser.id) {
        setSelectedUser(parsedUser);
      }
    }
  }, []);

  const filteredUsers = chatUsers?.filter(
    (u) => String(u.id) !== String(user?.id)
  );

  useEffect(() => {
    if (!socket) return;

    const handleUserStatusUpdate = (data) => {
      updateUser(data.userId, {
        status: data.status,
        last_seen: data.last_seen,
      });
    };

    socket.on("user_status_updated", handleUserStatusUpdate);

    return () => {
      socket.off("user_status_updated", handleUserStatusUpdate);
    };
  }, [socket, updateUser]);

  useEffect(() => {
    if (!socket) return;
    socket.on("user_offline", (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    });

    socket.on("user_online", (userId: string) => {
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    });

    return () => {
      socket.off("user_offline");
      socket.off("user_online");
    };
  }, [socket]);

  return (
    <div className="flex flex-col w-[272px] h-[829px]">
      <ChatSearch />

      <div className="flex items-center bg-gray_3/80 rounded-[20px] overflow-y-auto scrollbar-hidden mt-[21px] h-[764px]  ">
        <div
          className={`flex flex-col w-full mt-8  ${
            chatUsersData.isLoading || chatUsersData.isError
              ? "items-center justify-center"
              : "h-full"
          }`}
        >
          {chatUsersData.isError ? (
            <div className="text-red-500">
              Error: {chatUsersData.error?.message}
            </div>
          ) : chatUsersData.isLoading ? (
            <div className="flex items-center justify-center h-full ">
              <div className="animate-spin rounded-full size-8 border-4 border-white/70 border-t-transparent"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <MessageCircleWarning className="text-white/70" size={40} />
              <span className="text-white/70  text-center text-[16px]">
                No users available for chat!
              </span>
            </div>
          ) : (
            <AnimatePresence>
              {filteredUsers?.map((user: User) => (
                <motion.div
                  key={user.id} 
                  exit={{ opacity: 0 }} 
                  className={`flex items-center shrink-0 rounded-[20px] cursor-pointer transition-colors px-4 duration-200 hover:bg-gray_1 h-[88px]  ${
                    selectedUser?.id === user.id && "bg-gray_1"
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <img
                      src={user?.avatarurl}
                      alt="Profile"
                      className="rounded-full size-[50px]"
                    />
                    <div className="flex flex-col space-y-2">
                      <div className="w-[97px] h-[18px]">
                        <span className="block truncate text-[15px]">
                          {user.username}
                        </span>
                      </div>
                      <div className="w-[120px] h-[18px]">
                        <span className="block text-white/80 truncate text-[12px]">
                          {typedUserId && String(user?.id) === String(typedUserId) ? (
                            <span className="block text-yellow_4 truncate text-[12px]">
                              typing...
                            </span>
                          ) : user.id === user.last_message_sender_id ? (
                            `${user.last_message_content}`
                          ) : (
                            `You : ${user.last_message_content}`
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-1/3 items-center justify-center">
                      <div
                        className={`${
                          !user.is_blocked_by_me
                            ? "flex flex-col gap-4 items-center"
                            : "flex flex-col gap-2 items-center justify-center"
                        }`}
                      >
                        <span className="text-[13px] leading-none">
                          {user.status === "online"
                            ? "online"
                            : timeFormat(user.last_seen)}
                        </span>
                        {user.unread_count > 0 ? (
                          <div
                            className={`size-[18px] bg-yellow_4 rounded-full flex items-center justify-center`}
                          >
                            <span
                              className={`m-0 text-black  ${
                                user.unread_count > 9 ? "text-[8px]" : "text-[10px]"
                              } font-bold`}
                            >
                              {user.unread_count > 9 ? "+9" : user.unread_count}
                            </span>
                          </div>
                        ) : null}
                      </div>
                      {user.is_blocked_by_me ? (
                        <Ban size={20} className="text-red-500/80 m-0" />
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          {chatUsersData.hasNextPage && (
            <div className="flex items-center justify-center p-3">
              <button
                onClick={() => chatUsersData.fetchNextPage()}
                disabled={chatUsersData.isFetchingNextPage}
              >
                {chatUsersData.isFetchingNextPage ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full size-6 border-4 border-white/70 border-t-transparent"></div>
                  </div>
                ) : (
                  <span className="block text-[16px] text-white/70 hover:text-white">
                    More
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
