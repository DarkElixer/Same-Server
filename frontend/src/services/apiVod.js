import { wait } from "../util/helper";
import { getProfile, host } from "./apiIptv";

// get item by search in vod
export const getVodItemBySearch = async (type, query, page, attempt = 1) => {
  if (attempt >= 3) return;
  const res = await fetch(`${host}/${type}/search?q=${query}&page=${page}`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const { data, status } = await res.json();
  if (status === "fail") {
    await wait(1);
    await getProfile();
    return getVodItemBySearch(type, query, page, attempt + 1);
  }
  return data;
};

export const getSeriesOrMovie = async (
  {
    movieId = "",
    seasonId = "",
    episodeId = "",
    total_items,
    sortType,
    page = 1,
  },
  attempt = 1
) => {
  if (attempt >= 3) return;
  const res = await fetch(
    `${host}/vod/categories/series?movieId=${movieId}&seasonId=${seasonId}&episodeId=${episodeId}&page=${page}&sort=${sortType}`,
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
    await wait(1);
    await getProfile();
    return getSeriesOrMovie(
      { movieId, seasonId, episodeId, total_items, sortType, page },
      attempt + 1
    );
  }
  return data;
};

// get movie link
export const getMovieLiveLink = async (movieId, attempt = 1) => {
  if (attempt >= 3) return;
  const movieData = await getSeriesOrMovie({ movieId });
  const episodeId = movieData.data[0].id;
  const res = await fetch(
    `${host}/vod/play?episodeId=${episodeId}&seriesNumber=${0}`,
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
    await wait(1);
    await getProfile();
    return getMovieLiveLink(movieId, attempt + 1);
  }
  return data;
};

//get Series Link
export const getSeriesLiveLink = async (
  { movieId, seasonId, episodeId, seriesNo },
  attempt = 1
) => {
  if (attempt >= 3) return;
  const movieData = await getSeriesOrMovie({ movieId, seasonId, episodeId });
  const finalEpisodeId = movieData.data[0].id;
  const res = await fetch(
    `${host}/vod/play?episodeId=${finalEpisodeId}&seriesNumber=${seriesNo}`,
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
    await wait(2);
    await getProfile();
    return getSeriesLiveLink(
      { movieId, seasonId, episodeId, seriesNo },
      attempt + 1
    );
  }
  return data;
};
