import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { toast } from "react-hot-toast";
import moment from "moment";
import { MessageSquareLock } from "lucide-react";
import { Input } from "./Input";
import api from "@/utils/Axios";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/App";
import { useMessages } from "@/store/useMessages";

export const ChatArea = ({ isBlocked }) => {
  const { socket, user, selectedUser }: any = useStore();
  const { state } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isBlockedByUser, setBlockedByUser] = useState(false);
  const [isTyping, setTyping] = useState(false);
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useMessages(selectedUser ? String(selectedUser.id) : null);

  const allMessages = data?.pages.flat() || [];

  useEffect(() => {

    if (selectedUser) {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!socket || !user) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [socket, user, isTyping]);

  useEffect(() => {
    if (!socket || !user) {
      console.log("Socket or user not available");
      return;
    }

    socket.on("typing", (sid) => {
      if (String(sid) === String(selectedUser.id)) setTyping(true);
    });
    socket.on("stop_typing", (sid) => {
      if (String(sid) === String(selectedUser.id)) setTyping(false);
    });

    return () => {
      socket.off("typing");
      socket.off("stop_typing");
    };
  }, [socket, user, selectedUser]);

  const formatTimeDifference = (timestamp) => {
    const messageDate = new Date(timestamp);
    const now = new Date();
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
    if (!selectedUser || !state?.user) return;

    const checkBlockedStatus = async () => {
      try {
        const res = await api.get(`/users/blockReverse/${selectedUser?.id}`);
        if (res.data.blocked === true) {
          setBlockedByUser(true);
        } else {
          setBlockedByUser(false);
        }
      } catch (error) {
        console.error("Error fetching block status:", error);
      }
    };
    checkBlockedStatus();
    queryClient.invalidateQueries({ queryKey: ["chatUsers"] });
  }, [selectedUser]);

  // useEffect(() => {
  //   if (!selectedUser) return;

  // const getAllMessagesForAUser = async () => {
  //   const res = await api.post(`/messages/${selectedUser.id}`);
  //   console.log("messages from the receiver : ", res.data);
  // };
  // getAllMessagesForAUser();
  // const addLastRead = async () => {
  //   const lastMessage = conversation[conversation.length - 1];
  //   if (!lastMessage) return;
  //   if (lastMessage.sender_id !== user?.id)
  //     await api.post(
  //       `/messages/unreadCount/${lastMessage.conversation_id}/${user?.id}`
  //     );
  // };
  // addLastRead();
  // const { id } = JSON.parse(
  //   senderConversation[senderConversation.length - 1]
  // );

  // const addLastMessage = async () => {
  //   const res = await api.post(
  //     `/messages/unreadCount/${user?.id}/${conversation_id}`
  //   );
  // };
  // }, [selectedUser]);

  return (
    <>
      <div className="flex-1 overflow-y-auto  p-4 scrollbar-hidden">
        <div className="flex flex-col  gap-4">
          {allMessages.map((conv, index) => {
            const isFromCurrentUser =
              String(conv.sender_id) === String(user?.id);

            const isFirstMessageFromSender =
              index === 0 ||
              String(allMessages[index - 1].sender_id) !==
                String(conv.sender_id);
            return (
              <div
                key={index}
                className={`flex items-center gap-4 ${
                  isFromCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isFromCurrentUser && (
                  <div className="flex-shrink-0">
                    {isFirstMessageFromSender ? (
                      <img
                        src={conv.avatarurl}
                        className="rounded-full size-[50px]"
                      />
                    ) : (
                      <div className="size-10" />
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[400px] rounded-[15px] p-3 ${
                    isFromCurrentUser ? "bg-receiver_text" : "bg-sender_text"
                  }`}
                >
                  <span className="block text-[14px]  break-all">
                    {conv.content}
                  </span>
                  <div className="flex justify-end">
                    <span className="text-[10px] w-[32px] h-[13px] text-end">
                      {formatTimeDifference(conv.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {isTyping && (
            <div className="flex space-x-1 pl-1 pt-6">
              <span className="size-2 bg-white/50 rounded-full animate-bounce" />
              <span
                className="size-2 bg-white/50 rounded-full animate-bounce"
                style={{ animationDelay: "0.12s" }}
              />
              <span
                className="size-2 bg-white/50 rounded-full animate-bounce"
                style={{ animationDelay: "0.24s" }}
              />
            </div>
          )}
          <div ref={messagesEndRef} />
          {isBlocked ? (
            <div className="flex-1 p-4">
              <div className="flex flex-col items-center justify-end h-full text-white/50 text-sm">
                <MessageSquareLock size={30} />
                <p className="mt-2">You blocked {selectedUser.username}</p>
              </div>
            </div>
          ) : (
            isBlockedByUser && (
              <div className="flex-1 p-4">
                <div className="flex flex-col items-center justify-end h-full text-white/50 text-sm">
                  <MessageSquareLock size={30} />
                  <p className="mt-2">
                    You are blocked by {selectedUser.username}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div className="flex items-center justify-center p-3">
        <Input disabled={isBlocked || isBlockedByUser} />
      </div>
    </>
  );
};
