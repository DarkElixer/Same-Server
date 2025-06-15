const axios = require("axios");
const { headers } = require("../constants/data");

const portal = process.env.portal;

exports.getCategories = async (req, res, next) => {
  const { token } = req.body;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_categories&JsHttpRequest=1-xml`;
    const response = await axios(request, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data === "Authorization failed.")
      throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: response.data.js });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesByAlias = async (req, res, next) => {
  const { token } = req.body;
  const { alias } = req.params;
  console.log(token);
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_genres_by_category_alias&cat_alias=${alias}&JsHttpRequest=1-xml`;
    const response = await axios(request, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data === "Authorization failed.")
      throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: response.data.js });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesItem = async (req, res, next) => {
  const { token } = req.body;
  const { id } = req.params;
  const { page = 1, movieId } = req.query;
  if (movieId) return next();
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&category=${id}&sortby=added&genre=*&p=${page}&sortby=added&JsHttpRequest=1-xml`;
    const response = await axios(request, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data === "Authorization failed.")
      throw new Error("Authorization failed.");
    console.log(response.data.js);

    res.status(200).json({ status: "success", data: response.data.js });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesItemSeasonsAndEpisodeLink = async (req, res, next) => {
  const { token, total_items } = req.body;
  const pages = Math.ceil(total_items / 14);
  let { movieId, seasonId, episodeId, page, sort } = req.query;
  console.log(sort, pages);
  if (sort === "name-asc") {
    page = pages - page + 1;
  }
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&movie_id=${movieId}&season_id=${seasonId}&episode_id=${episodeId}&genre=*&p=${page}&JsHttpRequest=1-xml`;
    const response = await axios(request, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data === "Authorization failed.")
      throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: response.data.js });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err.message });
  }
};

exports.getVodStreamLink = async (req, res, next) => {
  const { token } = req.body;
  const { episodeId, seriesNumber = 0 } = req.query;
  try {
    const streamUrl = `http://${portal}/stalker_portal/server/load.php?type=vod&action=create_link&cmd=/media/file_${episodeId}.mpg&series=${seriesNumber}&JsHttpRequest=1-xml`;
    const response = await axios(streamUrl, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    const link = response.data?.js?.cmd;
    if (response.data === "Authorization failed.")
      throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: link });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err.message });
  }
};

exports.getVodBySearch = async (req, res, next) => {
  const { token } = req.body;
  const { q, page } = req.query;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&search=${q}&genre=*&p=${page}&sortby=added&JsHttpRequest=1-xml`;
    const response = await axios(request, {
      headers: {
        ...headers,
        Authorization: `Bearer ${token}`,
      },
    });
    // console.log(response.data);
    if (response.data === "Authorization failed.")
      throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: response.data.js });
  } catch (err) {
    res.status(401).json({ status: "fail", message: err.message });
  }
};
