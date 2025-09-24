import React from "react";
import { Link } from "react-router-dom";
import { useFriends } from "@/store/useFriends";
import { useStore } from "@/store/useStore";
import moment from "moment";
import { MessageCircleWarning } from "lucide-react";

export const ChatRightSidebar = () => {
  const { selectedUser, setSelectedUser, conversation } = useStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useFriends();

  if (isError) return <div>Error: {(error as Error).message}</div>;

  const allFriends = data?.pages.flat() || [];

  const selectedChat = conversation.filter(
    (msg) =>
      msg.sender_id === selectedUser?.id || msg.receiver_id === selectedUser?.id
  );
  const startedOn =
    selectedChat.length > 0 ? new Date(selectedChat[0].timestamp) : null;

  {
    allFriends?.length === 0 ? (
      <div className="text-white/70 text-sm text-center">
        No friends available for chat.
      </div>
    ) : null;
  }

  {
    isError ? (
      <div className="text-white/70 text-sm text-center">
        Error loading friends.
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col space-y-[32px] h-[829px] w-[295px]">
      {selectedUser && (
        <div className="flex flex-col items-center bg-gray_3/80 rounded-[20px] w-[295px] h-[303px] space-y-[50px]">
          <span className="mt-4 block text-[20px]  text-base   w-[113px] h-[24px]">
            Chat Info
          </span>
          <div className="flex flex-col p-4 w-full space-y-4">
            <div className="">
              <span className=" text-xs  text-base   w-[250px] h-[17px]">
                Conversation started
              </span>
            </div>
            {startedOn ? (
              <div className="self-end bg-green-300 w-full">
                <span className=" bg-red-900 text-[14px] text-end w-full h-[17px]">
                  {moment(startedOn).format("l")}
                </span>
              </div>
            ) : (
              <span className=" text-[14px] w-full h-[17px] text-end">
                Not started yet!
              </span>
            )}
          </div>

          <div className="flex items-center justify-center w-full bg-profile_link hover:bg-yellow_1/50 rounded-[15px] w-[240px] h-[38px]">
            <Link to="/prof">
              <button>
                <span className=" text-[16px]  text-base   w-115px] h-[19px]">
                  Profile
                </span>
              </button>
            </Link>
          </div>
        </div>
      )}
      <div
        className={`flex flex-col items-center bg-gray_3/80 rounded-[20px] w-[295px] ${
          selectedUser ? "h-[494px]" : "h-full"
        }`}
      >
        {allFriends?.length === 0 ? (
          <div className="flex flex-col justify-center items-center text-white/80 space-y-4 p-4">
            <MessageCircleWarning size={40} />
            <span className=" text-[16px]  text-base w-115px] h-[19px]">
              No friends available for chat.
            </span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full size-12 border-4 border-white/70 border-t-transparent"></div>
          </div>
        ) : null}

        <div className="flex items-center justify-center mt-6 w-[209px] h-[24px]">
          <span className=" text-[20px]  text-base  ">
            <span className="text-yellow_4">23</span> online friends
          </span>
        </div>

        <div className="overflow-y-auto scrollbar-hidden self-start h-full w-full my-8 px-4">
          <div className="space-y-2">
            {allFriends?.map((friend, index) => (
              <div
                onClick={() => setSelectedUser(friend)}
                key={friend.id}
                className={`flex items-center justify-around rounded-[15px] hover:bg-gray_1 transition-colors cursor-pointer h-[75px] ${
                  selectedUser?.id === friend.id && "bg-gray_1"
                }`}
              >
                <img
                  src={friend.avatarurl}
                  className="rounded-full size-[50px]"
                  alt={friend.username}
                />
                <div className="w-[120px] h-[19px]">
                  <span className="block text-[16px] truncate">
                    {friend.username}
                  </span>
                </div>
              </div>
            ))}
          </div>
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
