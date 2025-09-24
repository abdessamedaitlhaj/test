import api from "@/utils/Axios";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@/types/types"

const FRIENDS_PAGE_SIZE = 10

export const useFriends = () => {
  const { state: { user } } = useAuth();

  return useInfiniteQuery({
    queryKey: ["friends"],
    queryFn: async ({ pageParam }) => {
      const response = await api.get<{ friends: User[] }>(
        `/users/friends?limit=${FRIENDS_PAGE_SIZE}&offset=${pageParam}`);
      return response.data.friends;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < FRIENDS_PAGE_SIZE) {
        return undefined;
      }
      return allPages.flat().length + 1;
    },
    initialPageParam: 0,
    staleTime: 1000 * 10 * 1000,
    enabled: !!user?.accessToken,
  });
};
