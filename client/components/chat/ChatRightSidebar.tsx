import React from "react";
import { Link } from "react-router-dom";
import { useFriends } from "@/store/useFriends";
import { useStore } from "@/store/useStore";
import moment from "moment";
import { MessageCircleWarning, Users } from "lucide-react";
import { formatStartedSince } from "@/utils/chat/FormatStartedChatTime";

export const ChatRightSidebar = ({ startedSince }) => {
  const { selectedUser, setSelectedUser } = useStore();
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useFriends();

  const allFriends = data?.pages.flat() || [];

  return (

    <div className={`flex flex-col space-y-[32px] h-[829px] w-[295px] ${ isError || isLoading && "bg-gray_3/80 px-4 rounded-[20px]"}`}>
    { isError ? (
      <div className="flex items-center justify-center h-full w-full">
        <span className="text-red-500">Error: {error.message}</span>
      </div>
    ) : isLoading ? (
      <div className="flex items-center justify-center h-full w-full">
        <div className="animate-spin rounded-full size-10 border-4 border-white/70 border-t-transparent"></div>
      </div>
    ) : (
      <>
        { selectedUser && (
        <div className="flex flex-col items-center bg-gray_3/80 rounded-[20px] w-[295px] h-[303px] space-y-[50px]">
          <span className="mt-4 block text-[20px]     w-[113px] h-[24px]">
            Chat Info
          </span>
          <div className="flex flex-col p-4 w-full space-y-4">
            <div className="">
              <span className=" text-[14px] w-[250px] h-[17px]">
                Conversation started
              </span>
            </div>
            {startedSince ? (
              <div className="flex w-full">
                <span className="self-end text-[14px] text-end w-full h-[17px]">
                  {formatStartedSince(startedSince)}
                </span>
              </div>
            ) : (
              <span className=" text-[14px] w-full h-[17px] text-end">
                Not started yet!
              </span>
            )}
          </div>

          <div className="flex items-center justify-center bg-profile_link hover:bg-yellow_1/50 rounded-[15px] w-[240px] h-[38px]">
            <Link to="/prof">
              <button>
                <span className=" text-[16px] w-115px] h-[19px]">
                  Profile Link
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
          <div className="flex flex-col justify-center items-center text-white/70 p-4 gap-4 h-full">
            <Users size={40} />
            <span className=" text-[16px] w-115px] text-center">
              No friends online!
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mt-6 w-[209px] h-[24px]">
              <span className=" text-[20px]    ">
                <span className="text-yellow_4">{ allFriends[0].online_friends }</span> online friends
              </span>
            </div>

            <div className="overflow-y-auto scrollbar-hidden self-start h-full w-full my-4 px-4">
              <div className="space-y-2">
                {allFriends?.map((friend, index) => (
                  <div
                    onClick={() => setSelectedUser(friend)}
                    key={friend.id}
                    className={`relative flex items-center rounded-[15px] hover:bg-gray_1 transition-colors cursor-pointer h-[75px] ${
                      selectedUser?.id === friend.id && "bg-gray_1"
                    }`}
                  >
                    <div className="flex items-center gap-4 pl-4">
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
                    <div className="absolute size-[15px] rounded-full bg-green-500 bottom-2 left-12 border-[2px] border-gray_3" />
                  </div>
                ))}
              </div>
                {hasNextPage && (
              <div className="py-4 flex items-center justify-center">
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
                )}
            </div>
          </>
        )}
      </div>
      </>
      )
    }
    </div>
  );
};
