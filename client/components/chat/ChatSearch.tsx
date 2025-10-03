import { useStore } from "@/store/useStore";
import api from "@/utils/Axios";
import { timeFormat } from "@/utils/chat/TimeFormat";
import { Ban, Search, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export const ChatSearch = () => {
  const { setSelectedUser } = useStore();

  const [loadedChatUsers, setLoadedChatUsers] = useState([]);
  const [isLoadingChatUsers, setIsLoadingChatUsers] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const searchChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchChatRef.current &&
        !searchChatRef.current.contains(event.target as Node)
      ) {
        setCollapsed(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchChatRef]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value !== "") {
      setCollapsed(true);
      const searchTerm = e.target.value.toLowerCase();
      searchByUsername(searchTerm);
    } else {
      setCollapsed(false);
      setLoadedChatUsers([]);
    }
  };

  const handleSelectedUser = (user) => {
    setSelectedUser(user);
    setLoadedChatUsers([]);
    setCollapsed(false);
  };

  const searchByUsername = async (username: string) => {
    try {
      setIsLoadingChatUsers(true);
      const { data } = await api.get(`/users/searchChatUsers?srch=${username}`);
      console.log("Search Results:", data.users);
      setIsLoadingChatUsers(false);
      setLoadedChatUsers(data.users);
    } catch (err: any) {
      setIsLoadingChatUsers(false);
      setLoadedChatUsers([]);
    }
  };

  return (
    <div className="relative bg-gray_2 rounded-[10px]  ">
      <div className="relative flex w-full items-center p-2">
        <Search className="absolute left-2 text-white h-5 w-5" />
        <input
          onChange={handleSearch}
          type="text"
          placeholder="search"
          className="placeholder-white w-full pl-8 pr-2 py-1 text-sm focus:outline-none bg-transparent"
        />
      </div>
      {collapsed && (
        <div
          ref={searchChatRef}
          className="absolute bg-gray_2 shrink-0 flex flex-col text-white text-sm w-full  max-h-[300px] rounded-[10px] overflow-auto scrollbar-hidden items-center mt-2"
        >
          {isLoadingChatUsers ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="animate-spin rounded-full size-8 border-4 border-white/70 border-t-transparent"></div>
            </div>
          ) : loadedChatUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 h-full p-4">
              <Users className="text-white/70" size={40} />
              <span className="text-white/70  text-center text-[16px]">
                No user found!
              </span>
            </div>
          ) : (
            loadedChatUsers?.map((user: User, index: number) => {
              return (
                <div className="w-full" key={user.id}>
                  <div
                    onClick={() => handleSelectedUser(user)}
                    className="flex shrink-0 items-center justify-around  hover:bg-gray_3  cursor-pointer w-full h-[60px]"
                  >
                    <img
                      src={user?.avatarurl}
                      alt="Profile"
                      className="rounded-full size-[40px]"
                    />
                    <span className="block  w-[100px] text-start truncate">
                      {user.username}
                    </span>
                    <div
                      className={`flex items-center ${
                        user.is_blocked_by_me === 1
                          ? "justify-between"
                          : "justify-end"
                      } gap-2 w-[50px]`}
                    >
                      {user.status === "online" ? (
                        <span className="size-[10px] bg-green-500 rounded-full"></span>
                      ) : (
                        <span className="text-[10px]">
                          {timeFormat(user.last_seen)}
                        </span>
                      )}
                      {user.is_blocked_by_me === 1 && (
                        <Ban size={20} className="text-red-500/80 m-0" />
                      )}
                    </div>
                  </div>
                  {index !== loadedChatUsers.length - 1 && (
                    <hr className="border-t border-white/10 bottom-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
