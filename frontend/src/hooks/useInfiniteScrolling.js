import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

function useInfiniteScrolling(type, query, callback) {
  const { ref, inView } = useInView();
  const { data, fetchNextPage, isFetchingNextPage, status, hasNextPage } =
    useInfiniteQuery({
      queryKey: [type, query],
      queryFn: ({ pageParam }) => callback(type, query, pageParam),
      retry: false,
      cacheTime: Infinity,
      staleTime: Infinity,
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        const no_of_pages = Math.ceil(lastPage.total_items / 14);
        if (no_of_pages <= lastPageParam) {
          return undefined;
        }
        return lastPageParam + 1;
      },
    });
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);
  return { ref, data, isFetchingNextPage, status, hasNextPage };
}

export { useInfiniteScrolling };
