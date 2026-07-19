import { getProfile } from "./apiIptv";

// get item by search in vod
export const getVodItemBySearch = async (type, query, page) => {
  const res = await fetch(`/${type}/search?q=${query}&page=${page}`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const { data, status } = await res.json();
  if (status === "fail") {
    await getProfile();
    throw new Error("Failed to search vod items");
  }
  return data;
};

export const getSeriesOrMovie = async ({
  movieId = "",
  seasonId = "",
  episodeId = "",
  total_items,
  sortType,
  page = 1,
}) => {
  const res = await fetch(
    `/vod/categories/series?movieId=${movieId}&seasonId=${seasonId}&episodeId=${episodeId}&page=${page}&sort=${sortType}`,
    {
      method: "POST",
      body: JSON.stringify({
        token: localStorage.token,
        total_items,
      }),
      headers: {
        "Content-type": "application/json",
      },
    }
  );
  const { data, status } = await res.json();
  if (status === "fail") {
    await getProfile();
    throw new Error("Failed to fetch series/movie data");
  }
  return data;
};

// get movie link
export const getMovieLiveLink = async (movieId) => {
  const movieData = await getSeriesOrMovie({ movieId });
  const episodeId = movieData.data[0].id;
  const res = await fetch(
    `/vod/play?episodeId=${episodeId}&seriesNumber=${0}`,
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.token }),
      headers: {
        "Content-type": "application/json",
      },
    }
  );
  const { data, status } = await res.json();
  if (status === "fail") {
    await getProfile();
    throw new Error("Failed to fetch movie link");
  }
  return data;
};

//get Series Link
export const getSeriesLiveLink = async ({
  movieId,
  seasonId,
  episodeId,
  seriesNo,
}) => {
  const movieData = await getSeriesOrMovie({ movieId, seasonId, episodeId });
  const finalEpisodeId = movieData.data[0].id;
  const res = await fetch(
    `/vod/play?episodeId=${finalEpisodeId}&seriesNumber=${seriesNo}`,
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.token }),
      headers: {
        "Content-type": "application/json",
      },
    }
  );
  const { data, status } = await res.json();
  if (status === "fail") {
    await getProfile();
    throw new Error("Failed to fetch series link");
  }
  return data;
};
