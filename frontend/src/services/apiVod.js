import { fetchWithAuth } from "./apiIptv";

// get item by search in vod
export const getVodItemBySearch = async (type, query, page) => {
  const data = await fetchWithAuth(`/${type}/search?q=${query}&page=${page}`);
  if (data.status === "fail" || !data.data) {
    throw new Error("Failed to search vod items");
  }
  return data.data;
};

export const getSeriesOrMovie = async ({
  movieId = "",
  seasonId = "",
  episodeId = "",
  total_items,
  sortType = "",
  page = 1,
}) => {
  const data = await fetchWithAuth(
    `/vod/categories/series?movieId=${movieId}&seasonId=${seasonId}&episodeId=${episodeId}&page=${page}&sort=${sortType}`,
    { total_items }
  );
  if (data.status === "fail" || !data.data) {
    throw new Error("Failed to fetch series/movie data");
  }
  return data.data;
};

// get movie link
// NOTE: /vod/play needs the *file* id (used as /media/file_<id>.mpg), which is a
// different id space from movieId and from the route's episodeId. Only pass
// fileId here if it came from a listing's `id` field.
export const getMovieLiveLink = async (movieId, fileId = null) => {
  let targetEpisodeId = fileId;
  if (!targetEpisodeId) {
    const movieData = await getSeriesOrMovie({ movieId });
    targetEpisodeId = movieData?.data?.[0]?.id;
  }
  if (!targetEpisodeId) {
    throw new Error("Failed to resolve movie file id");
  }
  const data = await fetchWithAuth(
    `/vod/play?episodeId=${targetEpisodeId}&seriesNumber=${0}`
  );
  if (data.status === "fail" || !data.data) {
    throw new Error("Failed to fetch movie link");
  }
  return data.data;
};

// get Series Link
export const getSeriesLiveLink = async ({
  movieId,
  seasonId,
  episodeId,
  seriesNo,
}) => {
  // episodeId is the episode *record* id used to filter the list; the id that
  // /vod/play needs is the file id on the returned item (e.g. 2972958 -> 3359771).
  // This lookup is a translation, not a redundant fetch — do not skip it.
  const movieData = await getSeriesOrMovie({ movieId, seasonId, episodeId });
  const targetEpisodeId = movieData?.data?.[0]?.id;
  if (!targetEpisodeId) {
    throw new Error("Failed to resolve episode file id");
  }
  const data = await fetchWithAuth(
    `/vod/play?episodeId=${targetEpisodeId}&seriesNumber=${seriesNo}`
  );
  if (data.status === "fail" || !data.data) {
    throw new Error("Failed to fetch series link");
  }
  return data.data;
};
