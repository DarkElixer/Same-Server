const { stripAdultCategories } = require("../constants/data");
const { portalFetch } = require("../services/portalSession");
const { proxySegment: streamProxySegment, proxyManifest } = require("../services/streamProxy");
const { CACHE_TTL } = require("../constants/cache");

const portal = process.env.portal;

function statusFor(err) {
  if (err.code === "CIRCUIT_OPEN") return 503;
  if (err.code === "AUTH_FAILED") return 502;
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") return 504;
  return 502;
}

exports.proxySegment = async (req, res) => {
  return streamProxySegment(req, res, { isLive: false });
};

exports.proxyHttpStream = async (req, res) => {
  return proxyManifest(req, res, { proxyEndpoint: "/vod/proxy/segment", replaceTrack: true });
};

exports.getCategories = async (req, res, next) => {
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_categories&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: "vod:categories",
      ttl: CACHE_TTL.categories,
    });
    // filtered on the way out so the cache keeps the raw portal response
    res.status(200).json({ status: "success", data: stripAdultCategories(data.js) });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesByAlias = async (req, res, next) => {
  const { alias } = req.params;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_genres_by_category_alias&cat_alias=${alias}&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: `vod:genres:${alias}`,
      ttl: CACHE_TTL.genres,
    });
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesItem = async (req, res, next) => {
  const { id } = req.params;
  const { page = 1, movieId } = req.query;
  if (movieId) return next();
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&category=${id}&sortby=added&genre=*&p=${page}&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: `vod:list:${id}:${page}`,
      ttl: CACHE_TTL.listings,
    });
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesItemSeasonsAndEpisodeLink = async (req, res, next) => {
  const { total_items = 0 } = req.body;
  const pages = total_items > 0 ? Math.ceil(total_items / 14) : 0;
  let { movieId, seasonId, episodeId, page, sort } = req.query;
  if (sort === "name-asc" && pages > 0) {
    page = pages - page + 1;
  }
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&movie_id=${movieId}&season_id=${seasonId}&episode_id=${episodeId}&genre=*&p=${page}&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: `vod:episodes:${movieId}:${seasonId}:${episodeId}:${page}`,
      ttl: CACHE_TTL.listings,
    });
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getVodStreamLink = async (req, res, next) => {
  const { episodeId, seriesNumber = 0 } = req.query;
  try {
    const streamUrl = `http://${portal}/stalker_portal/server/load.php?type=vod&action=create_link&cmd=/media/file_${episodeId}.mpg&series=${seriesNumber}&JsHttpRequest=1-xml`;
    const data = await portalFetch(streamUrl);
    const link = data?.js?.cmd;
    if (!link) {
      throw new Error("Stream link missing in portal response");
    }
    res.status(200).json({ status: "success", data: link });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getVodBySearch = async (req, res, next) => {
  const { q, page } = req.query;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&search=${q}&genre=*&p=${page}&sortby=added&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: `vod:search:${q}:${page}`,
      ttl: CACHE_TTL.search,
    });
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};
