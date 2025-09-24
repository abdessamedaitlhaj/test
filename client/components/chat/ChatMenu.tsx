import React, { useEffect, useRef, useState } from "react";
import { useStore } from "@/store/useStore";
import { ToastContainer, toast } from "react-toastify";
import api from "@/utils/Axios";
import { useAuth } from "@/hooks/useAuth";
import menu from "../../../public/assests/menu.png";

export const ChatMenu = ({ isBlocked, setBlocked }) => {
  const [isToggle, setToggle] = useState(false);
  const { selectedUser } = useStore();
  const { state } = useAuth();
  const [isLoading, setLoading] = useState(false);
  // const [isBlocked, setBlocked] = useState(false);

  const onlineUsers = useStore((state) => state.onlineUsers);
  const lockedUsers: any = useStore((state: any) => state.lockedUsers);
  const ensureJoined = useStore((state) => state.ensureJoined);
  const socket = useStore((state) => state.socket); // Use socket from store
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isToggle &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setToggle(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isToggle]);

  // useEffect(() => {

  //   const isBlocked = async () => {
  //     try {
  //     const res = await api.get(`/users/block/${selectedUser?.id}`, {
  //       headers: {
  //         Authorization: `Bearer ${state?.user?.accessToken}`,
  //       },
  //     });
  //     if (res.data.blocked === true) {
  //       setBlocked(true);
  //     } else {
  //       setBlocked(false);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching block status:", error);
  //   }
  // };
  //   isBlocked();
  // }, [selectedUser]);

  const gameInvite = () => {
    if (!selectedUser || !socket) return;
    ensureJoined();
    socket.emit("send_invite", selectedUser);
    toast("dasda");
    setToggle(!isToggle);
  };

  const blockUser = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/users/block/${selectedUser.id}`);
      setLoading(false);
      if (res.status === 200) {
        toast(`User ${selectedUser.username} blocked successfully`);
        setBlocked(true);
        socket.emit("block_user", selectedUser.id);
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      toast.error("Failed to block user");
      setLoading(false);
      return;
    }
    setToggle(!isToggle);
  };

  const unblockUser = async () => {
    setLoading(true);

    try {
      const res = await api.post(`/users/unblock/${selectedUser.id}`);
      setLoading(false);
      if (res.status === 200) {
        toast.success(`User ${selectedUser.username} unblocked successfully`);
        setBlocked(false);
        socket.emit("unblock_user", selectedUser.id);
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      toast.error("Failed to unblock user");
      setLoading(false);
      return;
    }
    setToggle(!isToggle);
  };

  return (
    <>
      <div ref={menuRef} className="relative flex-shrink-0 mt-4">
        <div className="flex items-center">
          <div className="flex justify-center w-full">
            <span className="block text-[24px] text-center truncate w-[194px] h-[29px]">
              {selectedUser?.username}
            </span>
          </div>
          <div className="absolute right-10 flex items-center">
            <button onClick={() => setToggle(!isToggle)}>
              <img src={menu} alt="menu" className="w-[33px] h-[33px]" />
            </button>
          </div>
        </div>
        <hr className="border-t-1 mt-4 border-white [695px] h-[0px]" />

        {isToggle && (
          <div className="absolute right-12 top-8 bg-gray_3 flex z-40 rounded-[12px] w-[164px] h-[92px]">
            <div className="flex flex-col items-center justify-center w-full">
              <div className="flex items-center h-full justify-center hover:bg-gray_1 hover:rounded-t-[12px] w-full">
                <button onClick={gameInvite}>
                  <ToastContainer />

                  <span className="  text-base  ">Play</span>
                </button>
              </div>
              <hr className="border-t-1 border-white w-[163px] h[0px]" />
              <div className="flex items-center h-full justify-center hover:bg-gray_1 hover:rounded-b-[12px] w-full">
                {isLoading ? (
                  <div className="py-3 w-full flex items-center justify-center">
                    <div className="animate-spin rounded-full size-6 border-4 border-white/70 border-t-transparent"></div>
                  </div>
                ) : isBlocked ? (
                  <button onClick={unblockUser}>
                    <span className="  text-base  ">Unblock</span>
                  </button>
                ) : (
                  <button onClick={blockUser}>
                    <span className="  text-base  ">Block</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
