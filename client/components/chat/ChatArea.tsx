import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { MessageSquareLock } from "lucide-react";
import { Input } from "./Input";
import api from "@/utils/Axios";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/App";
import { useMessages } from "@/store/useMessages";

export const ChatArea = ({ isBlocked, setStartedSince }) => {
  const { socket, user, selectedUser, conversation }: any = useStore();
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

  const fetchedMessages = data?.pages.flat() || [];
  const allMessages = [...fetchedMessages, ...conversation];

  // reverse the messages to show the latest at the bottom
  allMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  //

  useEffect(() => {
    if (!selectedUser) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedUser, conversation]);

  useEffect(() => {
    if (selectedUser)
      queryClient.invalidateQueries({
        queryKey: ["messages"],
      });
  }, [selectedUser]);


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

  useEffect(() => {
    if (!selectedUser) return;

  const addLastRead = async () => {
    const lastMessage = allMessages[allMessages.length - 1];

    if (!lastMessage) return;

    if (lastMessage.sender_id !== user?.id)
      await api.post(
        `/messages/unreadCount/${lastMessage.conversation_id}/${selectedUser?.id}`
      );
        queryClient.invalidateQueries({ queryKey: ["chatUsers"] });

  };
  addLastRead();
  }, [selectedUser, allMessages]);


    const formatConversationStartedDate = (timestamp) => {
    if (!timestamp) return "Not started yet!";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const conversationStartedDate = allMessages.length > 0 ? allMessages[0].timestamp : null;
  setStartedSince(conversationStartedDate);
  
  return (
    <>
      <div className="flex-1 overflow-y-auto  p-4 scrollbar-hidden">
                  <div className="p-2 flex items-center justify-center">
            {hasNextPage ? (
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
            ) : (
                    <div className="flex flex-col items-center justify-center py-8">
                        <img
                            src={selectedUser.avatarurl}
                            alt={selectedUser.username}
                            className="rounded-full size-[90px] mb-4"
                        />
                        <h2 className="text-xl font-semibold text-white mb-2">{selectedUser.username}</h2>
                        <p className="text-white/70 text-sm">
                            {formatConversationStartedDate(conversationStartedDate)}
                        </p>
                    </div>
                )
            }
          </div>



        <div className="flex flex-col  gap-4">
          {allMessages?.map((conv, index) => {
            const isFromCurrentUser =
              String(conv.sender_id) === String(user?.id);

            const isFirstMessageFromSender =
              index === 0 ||
              String(allMessages[index - 1]?.sender_id) !==
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
      <div ref={messagesEndRef}></div>
      </div>
      <div className="flex items-center justify-center p-3">
        <Input disabled={isBlocked || isBlockedByUser} />
      </div>
    </>
  );
};