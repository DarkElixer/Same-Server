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
export const getMovieLiveLink = async (movieId) => {
  const movieData = await getSeriesOrMovie({ movieId });
  const episodeId = movieData.data[0].id;
  const data = await fetchWithAuth(
    `/vod/play?episodeId=${episodeId}&seriesNumber=${0}`
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
  const movieData = await getSeriesOrMovie({ movieId, seasonId, episodeId });
  const finalEpisodeId = movieData.data[0].id;
  const data = await fetchWithAuth(
    `/vod/play?episodeId=${finalEpisodeId}&seriesNumber=${seriesNo}`
  );
  if (data.status === "fail" || !data.data) {
    throw new Error("Failed to fetch series link");
  }
  return data.data;
};
