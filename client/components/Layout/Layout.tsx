import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Trophy,
  Home,
  Bell,
  Gamepad,
  Settings,
  MessageCircleMore,
  User,
  Search,
  Menu,
  Plus,
  Minus,
  X,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { Notification } from "@/components/Layout/Notification";
import api from "@/utils/Axios";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useStore();

  const [isToggle, setToggle] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const bellButtonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const { state, dispatch, setPersist } = useAuth();
  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState<searchUser[]>([]);
  const [st, setSt] = useState<string>("");
  const { socket } = useStore();
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isToggle &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        bellButtonRef.current &&
        !bellButtonRef.current.contains(event.target as Node)
      ) {
        setToggle(false);
        setMenuOpen(false);
      }
    }
    function handleClickOutsideSearch(event: MouseEvent) {
      if (
        searchResult.length > 0 &&
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResult([]);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("mousedown", handleClickOutsideSearch);
    };
  }, [isToggle, searchResult.length]);

  const InviteFriend = async (
    event: React.MouseEvent<HTMLButtonElement>,
    Id: string
  ) => {
    try {
      event.stopPropagation();
      const { data } = await api.post(
        `/users/user/freindRequests/?id=${state.user?.user.id}`,
        { recvId: Id },
        {
          headers: { Authorization: `Bearer ${state.user?.accessToken}` },
        }
      );

      console.log("InviteFriend: ", data);
    } catch (e: any) {
      console.error("InviteFriend error:", e.message);
      if (e.response?.data?.message) {
        toast.error(e.response.data.message);
      } else {
        toast.error("Failed to send friend request. Please try again.");
      }
    }
  };

  const searchByUsername = async (username: string) => {
    try {
      const { data } = await api.get(`/users/user/search?srch=${username}`, {
        headers: {
          Authorization: `Bearer ${state.user?.accessToken}`,
        },
      });

      setSearchResult(data.users);
    } catch (err: any) {
      setSearchResult([]);
      console.error("searchByUsername error:", err.message);
    }
  };

  const declineInvitation = async (
    event: React.MouseEvent<HTMLButtonElement>,
    requesterId: string
  ) => {
    try {
      event.stopPropagation();
      const { data } = await api.delete(
        `/users/user/freindRequests/${state.user?.user.id}`,
        {
          data: { requesterId },

          headers: {
            Authorization: `Bearer ${state.user?.accessToken}`,
          },
        }
      );

      console.log("declineInvitation: ", data);
    } catch (err: any) {
      console.error("declineInvitation error:", err.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <nav className="relative px-6 py-4 w-full">
        <div className=" flex items-center justify-between w-full">
          <div className="flex items-center space-x-8">
            <div className="flex items-center justify-center size-16 border-2 border-yellow_1 rounded-full">
              <span className="text-whitefont-bold text-lg">NTX</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="block relative">
              <Search
                strokeWidth={2}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5"
              />
              <input
                type="text"
                placeholder="search"
                onChange={(e) => searchByUsername(e.target.value)}
                className="w-full bg-gray_1 text-white pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow_1"
              />
              <div className="absolute bg-gray_1/50 right-3 top-1/2 transform -translate-y-1/2 bg-gray-700 px-2 py-1 rounded text-xs text-white border border-yellow_1 rounded-lg">
                ⌘ K
              </div>
              {searchResult.length > 0 && (
                <div
                  ref={searchRef}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray_1 p-4 rounded-xl flex flex-col space-y-4 max-h-[400px] overflow-y-auto scrollbar-hidden z-50 shadow-lg"
                >
                  {searchResult.map((user) => (
                    <div
                      onClick={() => {
                        setSearchResult([]);
                        navigate("/prof");
                      }}
                      key={user.id}
                      className="flex justify-between items-center hover:bg-gray_3/80 p-3 h-full rounded-lg cursor-pointer"
                    >
                      <p className="">{user.username}</p>
                      <div className="">
                        {user.friendship_status === "pending" ||
                        user.friendship_status === "accepted" ? (
                          <button
                            className="bg-gray_3 text-white hover:bg-red_1/80 p-2 rounded-full"
                            onClick={(e) => declineInvitation(e, user.id)}
                          >
                            <Minus size={20} />
                          </button>
                        ) : user.friendship_status === null ? (
                          <button
                            className="bg-gray_3 text-white hover:bg-yellow_3/80 p-2 rounded-full"
                            onClick={(e) => InviteFriend(e, user.id)}
                          >
                            <Plus size={20} />
                          </button>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span>{user?.username}</span>
            <button
              ref={bellButtonRef}
              onClick={() => setToggle(!isToggle)}
              className="flex justify-center items-center p-2 hover:bg-gray_1/70 rounded-full transition-colors border border-yellow_1 size-12 cursor-pointer"
            >
              <Bell strokeWidth={2} className="size-6" />
            </button>
            <Link to="/profile">
              <button className="flex justify-center items-center rounded-full border border-yellow_1 size-12 cursor-pointer">
                <img src={user?.avatarurl} className="rounded-full" />
              </button>
            </Link>
          </div>
        </div>
        <div className="flex justify-end">
          {isToggle && (
            <Notification setToggle={setToggle} isToggle={isToggle} />
          )}
        </div>
      </nav>

      <aside className="fixed flex justify-center left-0 top-0 bottom-0 w-20 z-40 pt-24">
        <div className="flex items-center">
          <div className="flex flex-col items-center justify-center h-[450px] px-4 rounded-tr-full rounded-br-full space-y-6 py-8 border-y-2 border-r-2 border-l-none border-t-yellow_2 border-r-yellow_2 border-b-yellow_2">
            <Link to="/">
              <button className="p-3 rounded-lg transition-all duration-300 ease-in-out group">
                <Home
                  strokeWidth={2}
                  className="text-white/80 size-6 group-hover:scale-125 transition-all duration-300 ease-in-out transform"
                />
              </button>
            </Link>
            <button className="p-3 rounded-lg transition-all duration-300 ease-in-out group">
              <Trophy
                strokeWidth={2}
                className="text-white/80 size-6 group-hover:scale-125 transition-all duration-300 ease-in-out transform"
              />
            </button>
            <Link to="/chat">
              <button className="p-3 rounded-lg transition-all duration-300 ease-in-out group">
                <MessageCircleMore
                  strokeWidth={2}
                  className="text-white/80 size-6 group-hover:scale-125 transition-all duration-300 ease-in-out transform"
                />
              </button>
            </Link>
            <Link to="/authcli">
              <button className="p-3 rounded-lg transition-all duration-300 ease-in-out group">
                <Gamepad
                  strokeWidth={2}
                  className="text-white/80 size-6 group-hover:scale-125 transition-all duration-300 ease-in-out transform"
                />
              </button>
            </Link>
            <button className="p-3 rounded-lg transition-all duration-300 ease-in-out group">
              <Settings
                strokeWidth={2}
                className="text-white/80 size-6 group-hover:scale-125 transition-all duration-300 ease-in-out transform"
              />
            </button>
          </div>
        </div>
      </aside>
      <main className="ml-20 p-6 flex items-center justify-center">
        {children}
      </main>
    </div>
  );
};
