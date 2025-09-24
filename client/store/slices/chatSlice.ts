import { StateCreator } from "zustand";
import api from "@/utils/Axios";
import { User } from "@/types/types";
import { useMessages } from "../useMessages";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  id?: number;
  sender_id: number;
  receiver_id: number;
  avatarurl?: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  sender_id: number;
  avatarurl: string;
  content: string;
  timestamp: string;
}

export interface ChatSlice {
  users: User[];
  messages: Message[];
  conversation: Conversation[];
  unreadCounts: Record<string, number>;
  conversationOrder: string[];
  selectedUser: User | null;
  setUsers: (users: User[]) => void;
  updateUser: (userId: number, updates) => void;
  setMessages: (messages: Message[]) => void;
  setConversation: (conversation: Conversation[]) => void;
  addMessage: (msg: Message, currentUserId?: string) => void;
  incrementUnreadCount: (userId: number) => void;
  resetUnreadCount: (userId: number) => void;
  updateConversationOrder: (userId: number) => void;
  setSelectedUser: (u: User) => void;
}

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (
  set,
  get
) => ({
  users: [],
  messages: [],
  conversation: [],
  unreadCounts: {},
  conversationOrder: [],
  selectedUser: null,
  setUsers: (users) => set({ users }),
  updateUser: (userId, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        String(user.id) === String(userId) ? { ...user, ...updates } : user
      ),
    })),
  setMessages: (messages) => set({ messages }),
  setConversation: (conversation) => set({ conversation }),
  updateConversationOrder: (userId) =>
    set((s) => ({
      conversationOrder: [
        String(userId),
        ...s.conversationOrder.filter((id) => id !== String(userId)),
      ],
    })),
  incrementUnreadCount: (userId) =>
    set((s) => ({
      unreadCounts: {
        ...s.unreadCounts,
        [userId]: (s.unreadCounts[userId] || 0) + 1,
      },
    })),
  resetUnreadCount: (userId) =>
    set((s) => ({ unreadCounts: { ...s.unreadCounts, [userId]: 0 } })),
  addMessage: (message, currentUserId) => {
    const selected = get().selectedUser;
    get().updateConversationOrder(selected.id);
    if (String(message.sender_id) !== String(selected?.id)) {
      get().incrementUnreadCount(message.sender_id);
      // const increment = async () => {
      //   await api.post(`/messages/unread/${message.sender_id}`);
      // };
      // increment();
    }
    set((s) => ({
      conversation: [
        ...s.conversation,
        {
          id: message.id,
          sender_id: message.sender_id,
          avatarurl: message.avatarurl,
          content: message.content,
          timestamp: message.timestamp,
        },
      ],
    }));
  },
  setSelectedUser: (user) => {
    if (user) get().resetUnreadCount(user.id);
    set({ selectedUser: user });
    if (user) {
      localStorage.setItem("selectedUser", JSON.stringify(user));
    }
  },
});
