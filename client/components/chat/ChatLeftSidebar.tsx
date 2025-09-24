import { useEffect, useState } from "react";
import { useStore } from "../../store/useStore";
import { useChatUsers } from "../../store/useChatUsers";
import { queryClient } from "@/App";
import { Ban, MessageCircleWarning, Search } from "lucide-react";

interface User {
  id: number;
  username: string;
  avatarurl: string;
  status: string;
  last_seen: string;
}

export const ChatLeftSidebar = () => {
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useChatUsers();

  const allChatUsers = data?.pages.flat() || [];

  const {
    user,
    users,
    updateUser,
    setUsers,
    selectedUser,
    setOnlineUsers,
    setSelectedUser,
    socket,
    onlineUsers,
    unreadCounts,
    conversationOrder,
    conversation,
  } = useStore();

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentSelectedUser = localStorage.getItem("selectedUser");
    if (currentSelectedUser) {
      const parsedUser = JSON.parse(currentSelectedUser);
      if (parsedUser && parsedUser.id) {
        setSelectedUser(parsedUser);
      }
    }
  }, [setSelectedUser]);

  const filteredUsers = allChatUsers?.filter(
    (u) => String(u.id) !== String(user?.id)
  );
  // useEffect(() => {
  //   if (allChatUsers && user?.id) {
  //     const filteredUsers = allChatUsers?.filter(
  //       (u) => String(u.id) !== String(user.id)
  //     );
  //     setUsers(filteredUsers);
  //   }
  // }, [allChatUsers, user?.id, setUsers]);

  const orderMap = new Map();
  conversationOrder.forEach((id, index) => {
    orderMap.set(id, index);
  });

  const sortedUsers = users.sort((a, b) => {
    const indexA = orderMap.get(String(a.id)) ?? Infinity;
    const indexB = orderMap.get(String(b.id)) ?? Infinity;

    return indexA - indexB;
  });

  const formatTimeDifference = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date(currentTime);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);

    if (diffSeconds < 60) return "Now";

    const diffMinutes = Math.floor(diffSeconds / 60);
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

  if (isError) return <div>Error: {(error as Error).message}</div>;


  return (
    <div className="flex flex-col w-[272px] h-[829px]">
      <div className="bg-gray_2 rounded-[10px]  ">
        <div className="relative flex w-full items-center p-2">
          <Search className="absolute left-2 text-white h-5 w-5" />
          <input
            type="text"
            placeholder="search"
            className="placeholder-white w-full pl-8 pr-2 py-1 text-sm focus:outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="bg-gray_3/80 rounded-[20px] overflow-y-auto scrollbar-hidden mt-[21px] h-full">
        <div
          className={`flex flex-col h-full w-full  gap-2 ${
            isLoading ? "items-center justify-center" : ""
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full size-8 border-4 border-white/70 border-t-transparent"></div>
            </div>
          ) : null}
          {filteredUsers.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4 h-full">
              <MessageCircleWarning className="text-white/70" size={50} />
              <span className="text-white/70  text-center text-[16px] bg-green-400">
                No users available for chat!
              </span>
            </div>
          ) : null}
          {filteredUsers?.map((user: User) => {
            return (
              <div
                className={`flex items-center shrink-0 rounded-[20px] cursor-pointer transition-colors px-4 duration-200 hover:bg-gray_1 h-[88px]  ${
                  selectedUser?.id === user.id && "bg-gray_1"
                }`}
                key={user.id}
                onClick={() => setSelectedUser(user)}
              >
                <div className="flex items-center justify-between w-full">
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
                        {user.unread_count > 0
                          ? user.last_message || `Say hello to ${user.username}`
                          : `You : ${user.last_message}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-center justify-center">
                    <div
                      className={`${
                        !user.is_blocked_by_me
                          ? "flex flex-col gap-4 items-center"
                          : "flex flex-col gap-2 items-center justify-center"
                      }`}
                    >
                      <span className="text-[13px] leading-none">
                        {onlineUsers.includes(String(user.id))
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
          })}
          <div className="p-2 flex items-center justify-center">
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
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
