import "./global.css";

import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import RemoteGamePage from "./pages/RemoteGamePage";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Porfile";
import PersistLogin from "./components/PersistLogin";
import MatchmakingPage from "./pages/MatchmakingPage";
import EventsPage from "./pages/EventsPage";
import TournamentPage from "./pages/TournamentPage";
import RemoteSettingsPage from "./pages/RemoteSettingsPage";
import PlayerStatsPage from "./pages/PlayerStatsPage";
import MatchStatsPage from "./pages/MatchStatsPage";
import AuthCliPage from "./pages/AuthCliPage";
import {Test} from "./test";

import { Layout } from "./components/Layout/Layout";

import { toast, ToastContainer } from "react-toastify";
import { ChatPage } from "@/pages/ChatPage";
import { ContextProvider } from "./context/Context";
import { InviteNotification } from "@/components/InviteNotification";
import { TournamentInviteCards } from "@/components/TournamentInviteCards";
import { CliNavigator } from "@/components/CliNavigator";
import "@/conf/i18n";
import { useEffect, useState } from "react";
import { useStore } from "./store/useStore";
import { ProfilePage } from "./pages/ProfilePage";
import { X } from "lucide-react";
import { chatToast } from "./utils/chatToast";

export const queryClient = new QueryClient();

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  avatarurl: string;
  content: string;
  timestamp: string;
  conversation_id: number;
}

interface User {
  id: number;
  username: string;
  avatarurl: string;
}

  const CloseButton = ({ closeToast }) => (
    <X size={20}
    className="cursor-pointer text-[20px] font-bold"
      onClick={closeToast}  strokeWidth={2}
    />
  );

const notify = (sender: User, content: string) => {
    toast(({ closeToast }) => <chatToast sender={sender} content={content}  closeToast={closeToast} />, {
      className: "bg-gray_2 text-white",
    });
  };

const App = () => {
  const { socket, user, addMessage, selectedUser, chatUsers } =
    useStore();

  useEffect(() => {
    if (!socket || !user) {
      console.log("Socket or user not available");
      return;
    }

    socket.on("receive_message", (receiverData) => {
      if (String(receiverData.newMessage.receiver_id) === String(user?.id)) {

        console.log("New message received for current user:", receiverData.newMessage);
        notify(receiverData.sender, receiverData.newMessage.content);
      }
      if (
        (String(receiverData.newMessage.sender_id) === String(user.id) &&
          String(receiverData.newMessage.receiver_id) === String(selectedUser?.id)) ||
        (String(receiverData.newMessage.receiver_id) === String(user.id) &&
          String(receiverData.newMessage.sender_id) === String(selectedUser?.id))
      ) {
        addMessage(receiverData.newMessage);
        if (!chatUsers.find((u) => String(u.id) === String(receiverData.newMessage.sender_id))) {
          socket.emit("refresh_chat_users", receiverData.newMessage.receiver_id);
        }
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [socket, user, selectedUser, addMessage]);





  return (
    <ContextProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<PersistLogin />}>
                <Route path="/tesst" element={<Test />}/>
                <Route path="/" element={<HomePage />} />
                <Route path="/play" element={<GamePage />} />
                <Route path="/remote" element={<RemoteGamePage />} />
                <Route path="/matchmaking" element={<MatchmakingPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/tournament" element={<TournamentPage />} />
                <Route
                  path="/remotesettings"
                  element={<RemoteSettingsPage />}
                />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/prof" element={<ProfilePage />} />
                <Route path="/playerstats" element={<PlayerStatsPage />} />
                <Route path="/matchstats" element={<MatchStatsPage />} />
                <Route path="/authcli" element={<AuthCliPage />} />
                <Route
                  path="/invite"
                  element={
                    <div className="bg-gray-300 flex items-center justify-center text-lg text-gray-500" />
                  }
                />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          <InviteNotification />
          <TournamentInviteCards />
          <CliNavigator />
          <ToastContainer  position="top-right" autoClose={3000} limit={3} stacked closeButton={CloseButton}/>
        </BrowserRouter>
      </QueryClientProvider>
    </ContextProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
