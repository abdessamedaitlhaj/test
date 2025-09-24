import api from "@/utils/Axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/types"

const CHAT_USERS_PAGE_SIZE = 10

export const useChatUsers = () => {
  const { state : {user} } = useAuth();

  return useInfiniteQuery({
    queryKey: ["chatUsers"],
    queryFn: async ({ pageParam }) => {
      const response = await api.get<{ users: User[] }>(
        `/users/chatUsers?limit=${CHAT_USERS_PAGE_SIZE}&offset=${pageParam}`);
      return response.data.users;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < CHAT_USERS_PAGE_SIZE) {
        return undefined;
      }
      return allPages.flat().length + 1;
    },
    initialPageParam: 0,
    enabled: !!user?.accessToken,
    staleTime: 1000 * 10 * 1000,
  });
};
