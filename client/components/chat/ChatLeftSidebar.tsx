import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import { useChatUsers } from "../../store/useChatUsers";
import { queryClient } from "@/App";
import { Ban, MessageCircleWarning, Search } from "lucide-react";
import { selectChatUsers } from "server/models/Users";

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
}: {
  chatUsersData: dataProps;
}) => {
  const {
    user,
    chatUsers,
    setChatUsers,
    updateUser,
    selectedUser,
    setOnlineUsers,
    setSelectedUser,
    socket,
    onlineUsers,
    unreadCounts,
    conversationOrder,
    conversation,
  } = useStore();

  useEffect(() => {
    const currentSelectedUser = localStorage.getItem("selectedUser");
    if (currentSelectedUser) {
      const parsedUser = JSON.parse(currentSelectedUser);
      if (parsedUser && parsedUser.id) {
        setSelectedUser(parsedUser);
      }
    }
  }, [setSelectedUser]);

  const filteredUsers = chatUsers?.filter(
    (u) => String(u.id) !== String(user?.id)
  );

  const formatTimeDifference = (timestamp) => {
    const messageDate = new Date(timestamp).getTime();
    const diffMs = Date.now() - messageDate;

    if (diffMs < 60000) return "Now";

    const diffMinutes = Math.floor(diffMs / 60000);
    if (diffMinutes < 60) return `${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 365) return `${diffDays}d`;

    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears}y`;
  };

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
      <div className="relative bg-gray_2 rounded-[10px]  ">
        <div className="relative flex w-full items-center p-2">
          <Search className="absolute left-2 text-white h-5 w-5" />
          <input
            type="text"
            placeholder="search"
            className="placeholder-white w-full pl-8 pr-2 py-1 text-sm focus:outline-none bg-transparent"
          />
        </div>
        <div className="absolute shrink-0 bg-gray_2 flex flex-col text-white text-sm w-full  max-h-[300px] rounded-[10px] overflow-auto scrollbar-hidden items-center mt-2 gap-2">
          <div className="flex  shrink-0 items-center justify-around  hover:bg-gray_3/80 rounded-[10px] cursor-pointer w-full h-[50px]">
            <span className="block">ahmed</span>
            <div>
              <span className="text-[12px]">2d</span>
              <Ban size={20} className="text-red-500/80 m-0" />
            </div>
          </div>
          <div className="flex  shrink-0 items-center justify-around  hover:bg-gray_3/80 rounded-[10px] cursor-pointer w-full h-[50px]">
            <span className="block">ahmed</span>
            <div>
              <span className="rounded-full bg-green-400 size-2"></span>
              <Ban size={20} className="text-red-500/80 m-0" />
            </div>

          </div>
        </div>
      </div>

      <div className="bg-gray_3/80 rounded-[20px] overflow-y-auto scrollbar-hidden mt-[21px] h-full ">
        <div
          className={`flex flex-col w-full my-8 ${
            chatUsersData.isLoading || chatUsersData.isError
              ? "items-center justify-center h-full"
              : ""
          }`}
        >
          {chatUsersData.isError ? (
            <div className="text-red-500">
              Error: {chatUsersData.error?.message}
            </div>
          ) : chatUsersData.isLoading ? (
            <div className="flex items-center justify-center h-full">
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
            filteredUsers?.map((user: User) => {
              return (
                <div
                  className={`flex items-center shrink-0 rounded-[20px] cursor-pointer transition-colors px-4 duration-200 hover:bg-gray_1 h-[88px]  ${
                    selectedUser?.id === user.id && "bg-gray_1"
                  }`}
                  key={user.id}
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
                          {user.id === user.last_message_sender_id
                            ? user.last_message_content ||
                              `Say hello to ${user.username}`
                            : `You : ${user.last_message_content}`}
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
                            : formatTimeDifference(user.last_seen)}
                        </span>
                        {user.unread_count > 0 ? (
                          <div
                            className={`size-[18px] bg-yellow_4 rounded-full flex items-center justify-center`}
                          >
                            <span
                              className={`m-0 text-black  ${
                                user.unread_count > 9
                                  ? "text-[8px]"
                                  : "text-[10px]"
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
                </div>
              );
            })
          )}
          <div className="p-2 flex items-center justify-center">
            {chatUsersData.hasNextPage && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
