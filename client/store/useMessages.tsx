import api from "@/utils/Axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: Date;
}

const MESSAGES_PAGE_SIZE = 20;

export const useMessages = (userId: string) => {
  const {
    state: { user },
  } = useAuth();

  if (!userId) return;
  
  return useInfiniteQuery({
    queryKey: ["messages"],
    queryFn: async ({ pageParam }) => {
      const response = await api.get<{ messages: Message[] }>(
        `/messages/conversation/${userId}?limit=${MESSAGES_PAGE_SIZE}&offset=${pageParam}`
      );
      return response.data.conversation;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < MESSAGES_PAGE_SIZE) {
        return undefined;
      }
      return allPages.flat().length + 1;
    },
    initialPageParam: 0,
    staleTime: 1000 * 10 * 1000,
    enabled: !!user?.accessToken,
  });
};
