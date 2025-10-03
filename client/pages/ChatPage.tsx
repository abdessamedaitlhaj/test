import { ChatArea } from "../components/chat/ChatArea";
import { ChatLeftSidebar } from "../components/chat/ChatLeftSidebar";
import { ChatRightSidebar } from "../components/chat/ChatRightSidebar";
import { useStore } from "../store/useStore";
import { useEffect, useState } from "react";
import { ChatMenu } from "../components/chat/ChatMenu";
import { MessageSquare } from "lucide-react";
import api from "@/utils/Axios";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/App";
import { useChatUsers } from "@/store/useChatUsers";

export const ChatPage = () => {
  const { selectedUser, socket, unreadCounts, setChatUsers } = useStore();
  const { state } = useAuth();
  const [isTyping, setTyping] = useState(false);
  const [isBlocked, setBlocked] = useState(false);
  const [startedSince, setStartedSince] = useState<Date | null>(null);
  const [typedUserId, setTypedUserId] = useState<number | null>(null);
  const [deleteChat, setDeleteChat] = useState(false);

  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useChatUsers();

  useEffect(() => {
    const allChatUsers = data?.pages.flat() || [];
    setChatUsers(allChatUsers);
  }, [data]);

  useEffect(() => {
    if (!selectedUser || !state?.user) return;

    const checkBlockedStatus = async () => {
      try {
        const res = await api.get(`/users/block/${selectedUser?.id}`);
        if (res.data.blocked === true) {
          setBlocked(true);
        } else {
          setBlocked(false);
        }
      } catch (error) {
        console.error("Error fetching block status:", error);
      }
    };
    checkBlockedStatus();
    queryClient.invalidateQueries({ queryKey: ["chatUsers"] });

    socket.on("typing", (sid) => {
      setTypedUserId(sid);
      if (String(sid) === String(selectedUser.id)) setTyping(true);
    });
  
    socket.on("stop_typing", (sid) => {
      setTypedUserId(null);
      setTyping(false);
    });

    if (String(typedUserId) !== String(selectedUser.id)) {
      setTyping(false);
    }

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [selectedUser]);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
    queryClient.invalidateQueries({ queryKey: ["friends"] });
  }, [isBlocked]);

  useEffect(() => {
    socket.on("refresh_chat_users", (u) => {
      queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
    });

    return () => {
      socket.off("refresh_chat_users");
    };
  }, [socket, setChatUsers]);

  return (
    <div className="flex h-[900px] gap-4 w-full">
      <ChatLeftSidebar
        chatUsersData={{
          hasNextPage,
          fetchNextPage,
          isFetchingNextPage,
          isLoading,
          isError,
          error,
        }}
        typedUserId={typedUserId}
      />
      <div className="flex-1 bg-gray_3/80 rounded-[27px] flex flex-col w-[695px] h-[829px]">
        {selectedUser ? (
          <>
            <ChatMenu isBlocked={isBlocked} setBlocked={setBlocked} />
            <ChatArea
              isBlocked={isBlocked}
              setStartedSince={setStartedSince}
              isTyping={isTyping}
            />
          </>
        ) : (
          <div className="flex flex-col gap-4 items-center justify-center h-full">
            <MessageSquare className="text-white/50 size-16" />
            <p className="text-white/50">No user is selected</p>
          </div>
        )}
      </div>
      <ChatRightSidebar startedSince={startedSince} />
      <div></div>
    </div>
  );
};
