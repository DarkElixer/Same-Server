import { useInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

function useInfiniteSeriesScrolling(
  type,
  query,
  callback,
  { sort: sortType, selectedEpisodeRange }
) {
  const initPage = selectedEpisodeRange?.start || 1;
  let endPage = selectedEpisodeRange?.end || Infinity;
  const { ref, inView } = useInView();
  /* eslint-disable */
  const { total_items, ...excludedQuery } = query;
  const { data, fetchNextPage, isFetchingNextPage, status, hasNextPage } =
    useInfiniteQuery({
      queryKey: [type, excludedQuery, sortType, selectedEpisodeRange],
      queryFn: ({ pageParam }) =>
        callback({ ...query, sortType, page: pageParam }),
      retry: false,
      cacheTime: Infinity,
      staleTime: Infinity,
      initialPageParam: initPage,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        endPage =
          endPage === Infinity ? Math.ceil(lastPage.total_items / 14) : endPage;
        if (lastPageParam >= endPage) return undefined;
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

export { useInfiniteSeriesScrolling };
