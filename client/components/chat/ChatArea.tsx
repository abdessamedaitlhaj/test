import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../../store/useStore";
import { Check, CheckCheck, EllipsisVertical, MessageSquareLock } from "lucide-react";
import { Input } from "./Input";
import api from "@/utils/Axios";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/App";
import { useMessages } from "@/store/useMessages";
import { toast } from "react-toastify";
import { timeFormat } from "@/utils/chat/TimeFormat";
import { PiCheckLight } from "react-icons/pi";
import { PiChecksLight } from "react-icons/pi";
import { all } from "axios";


export const ChatArea = ({ isBlocked, setStartedSince, isTyping }) => {
  const { socket, user, selectedUser, conversation }: any = useStore();
  const { state } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isBlockedByUser, setBlockedByUser] = useState(false);
  const {
    data,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useMessages(selectedUser ? String(selectedUser.id) : null);
  const [showSmallMenu, setShowSmallMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const typingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSmallMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    typingRef.current?.scrollIntoView({ behavior: "instant" });
  }, [isTyping]);

  const filteredConversation = conversation?.filter(
    (msg) =>
      (String(msg.receiver_id) === String(selectedUser?.id) &&
      String(msg.sender_id) === String(user?.id)) ||
      (String(msg.sender_id) === String(selectedUser?.id) &&
      String(msg.receiver_id) === String(user?.id))
  );

  const fetchedMessages = data?.pages.flat() || [];
  const allMessages = [...fetchedMessages, ...(filteredConversation || [])];

  allMessages.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  useEffect(() => {
    if (!selectedUser) return;
      const timer = setTimeout(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, 300);
  }, [selectedUser, conversation]);



  useEffect(() => {
    if (!socket || !user) {
      console.log("Socket or user not available");
      return;
    }

    socket.on("user_blocked", (data: { userId: string; blockedId: string }) => {
      if (String(data.userId) === String(selectedUser?.id)) {
        toast("You are blocked by this user");
        setBlockedByUser(true);
      }
    });
    socket.on(
      "user_unblocked",
      (data: { userId: string; unblockedId: string }) => {
        if (String(data.userId) === String(selectedUser?.id)) {
          toast("You are unblocked by this user");
          setBlockedByUser(false);
        }
      }
    );



    // socket.on("message_read", (data: { messageId: number; readerId: string }) => {
    //   if (String(data.readerId) === String(selectedUser?.id)) {
    //     const updatedMessages = allMessages.map((msg) =>
    //       msg.id === data.messageId ? { ...msg, read: true } : msg
    //     );
    //     queryClient.setQueryData(["messages", selectedUser?.id], updatedMessages);
    //   }
    // });

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
    queryClient.invalidateQueries({ queryKey: ["messages"] });

    return () => {
      socket.off("user_blocked");
      socket.off("user_unblocked");
      socket.off("message_read");
    };
  }, [socket, user, selectedUser]);

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
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const conversationStartedDate =
    allMessages.length > 0 ? allMessages[0].timestamp : null;
  setStartedSince(conversationStartedDate);

  return (
    <>
      {isError ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-red-500">
            {String((error as any)?.message || "An error occurred")}
          </p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full size-10 border-4 border-white/70 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-4 scrollbar-hidden">
            {hasNextPage ? (
              <div className="p-2 flex items-center justify-center">
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
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img
                  src={selectedUser.avatarurl}
                  alt={selectedUser.username}
                  className="rounded-full size-[90px] mb-4"
                />
                <h2 className="text-[20px] w-[400px] truncate text-center font-semibold text-white mb-2">
                  {selectedUser.username}
                </h2>
                <p className="text-white/70 text-sm">
                  {formatConversationStartedDate(conversationStartedDate)}
                </p>
              </div>
            )}

            <div className="flex flex-col  gap-4">
              {allMessages?.map((conv, index) => {
                const isFromCurrentUser =
                  String(conv.sender_id) === String(user?.id);

                const isLastMessageFromSender = 
                index === allMessages.length - 1 ? String(user?.id) !== String(allMessages[index]?.sender_id) : false;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 ${
                      isFromCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isFromCurrentUser && (
                      <div className="flex-shrink-0">
                        {isLastMessageFromSender ? (
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
                      className={`relative flex flex-col gap-1  max-w-[400px] rounded-[15px] p-3 ${
                        isFromCurrentUser
                          ? "bg-sender_text"
                          : "bg-receiver_text"
                      }`}
                    >
                      <span className="block text-[14px]  break-all">
                        {conv.content}
                      </span>
                      <div className="flex justify-end gap-1 items-center">
                        <span className="text-[10px] w-[32px] h-[13px] text-end">
                          {timeFormat(conv.timestamp)}
                        </span>
                        <div className="flex">
                          { isFromCurrentUser && (
                          <div className="">
                            <PiChecksLight strokeWidth={10} size={20} />
                          </div>
                        )}
                        </div>
                      </div>
                    
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div ref={typingRef} className="flex space-x-1 ml-[66px] mt-[16px]">
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
              <div />
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
            <div ref={messagesEndRef} ></div>
          </div>
          <div className="relative flex items-center justify-center p-3">
            <Input disabled={isBlocked || isBlockedByUser} />
          </div>
        </>
      )}
    </>
  );
};
