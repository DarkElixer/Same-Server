const axios = require("axios");
const { Parser } = require("m3u8-parser");
const { URL } = require("url");
const { headers } = require("../constants/data");
const { portalRequest } = require("../services/portalClient");

const portal = process.env.portal;
let lastIndex = -1;

function statusFor(err) {
  if (err.code === "CIRCUIT_OPEN") return 503;
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") return 504;
  return 401;
}

function getCleanProxyHeaders(req) {
  const clean = { ...headers };
  if (req.headers["range"]) clean["range"] = req.headers["range"];
  if (req.headers["accept"]) clean["accept"] = req.headers["accept"];
  if (req.headers["user-agent"]) clean["user-agent"] = req.headers["user-agent"];
  return clean;
}

exports.proxySegment = async (req, res) => {
  try {
    const segmentUrl = decodeURIComponent(req.query.url);
    // Fetch the segment with axios using stream response
    const response = await axios.get(segmentUrl, {
      headers: getCleanProxyHeaders(req),
      responseType: "stream",
    });

    // Forward headers from the original response
    Object.entries(response.headers).forEach(([name, value]) => {
      res.setHeader(name, value);
    });

    // Pipe the response stream
    response.data.pipe(res);
  } catch (error) {
    console.error("Segment proxy error:", error);
    res.status(500).send("Segment proxy error");
  }
};

exports.proxyHttpStream = async (req, res, next) => {
  try {
    const originalUrl = decodeURIComponent(req.query.url);

    for (let i = originalUrl.length - 1; i > 0; i--) {
      if (originalUrl[i] === "/") {
        lastIndex = i;
        break;
      }
    }
    let baseUrl = originalUrl.substring(0, lastIndex + 1);
    // Fetch the original m3u8 with axios
    let changedUrlToTrack = originalUrl.replace(
      /index.m3u8|video.m3u8/g,
      "tracks-v1a1/mono.m3u8"
    );
    const response = await axios.get(changedUrlToTrack, {
      headers: getCleanProxyHeaders(req),
      responseType: "text",
    });

    // const response = await fetch(changedUrlToTrack, {
    //   headers: { ...req.headers, Host: new URL(originalUrl).hostname },
    // });
    const data = await response.data;
    const m3u8Content = data;
    const parser = new Parser();

    parser.push(m3u8Content);
    parser.end();

    // const parsedManifest = parser.manifest;

    // Rewrite URIs to point to our proxy
    const rewrittenManifest = m3u8Content
      .split("\n")
      .map((line) => {
        // Handle segment lines (either .ts or .m3u8)
        if (
          line.split("?")[0].endsWith(".ts") ||
          line.split("?")[0].endsWith(".m3u8")
        ) {
          // Skip comments and empty lines
          if (line.startsWith("#")) return line;

          // Convert relative URLs to absolute
          const segmentUrl = line.startsWith("http")
            ? line
            : new URL(line, baseUrl).href;

          // Point to our proxy endpoint
          return `/vod/proxy/segment?url=${encodeURIComponent(segmentUrl)}`;
        }
        return line;
      })
      .join("\n");
    res.header("Content-Type", "application/vnd.apple.mpegurl");
    res.send(rewrittenManifest);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).send("Proxy error");
  }
};

exports.getCategories = async (req, res, next) => {
  const { token } = req.body;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_categories&JsHttpRequest=1-xml`;
    const data = await portalRequest(request, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: "vod:categories",
      ttl: 15 * 60 * 1000,
      shouldCache: (data) => data !== "Authorization failed.",
    });
    if (data === "Authorization failed.") throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesByAlias = async (req, res, next) => {
  const { token } = req.body;
  const { alias } = req.params;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_genres_by_category_alias&cat_alias=${alias}&JsHttpRequest=1-xml`;
    const data = await portalRequest(request, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `vod:genres:${alias}`,
      ttl: 15 * 60 * 1000,
      shouldCache: (data) => data !== "Authorization failed.",
    });
    if (data === "Authorization failed.") throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesItem = async (req, res, next) => {
  const { token } = req.body;
  const { id } = req.params;
  const { page = 1, movieId } = req.query;
  if (movieId) return next();
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&category=${id}&sortby=added&genre=*&p=${page}&sortby=added&JsHttpRequest=1-xml`;
    const data = await portalRequest(request, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `vod:list:${id}:${page}`,
      ttl: 3 * 60 * 1000,
      shouldCache: (data) => data !== "Authorization failed.",
    });
    if (data === "Authorization failed.") throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesItemSeasonsAndEpisodeLink = async (req, res, next) => {
  const { token, total_items } = req.body;
  const pages = Math.ceil(total_items / 14);
  let { movieId, seasonId, episodeId, page, sort } = req.query;
  if (sort === "name-asc") {
    page = pages - page + 1;
  }
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&movie_id=${movieId}&season_id=${seasonId}&episode_id=${episodeId}&genre=*&p=${page}&JsHttpRequest=1-xml`;
    const data = await portalRequest(request, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `vod:episodes:${movieId}:${seasonId}:${episodeId}:${page}`,
      ttl: 3 * 60 * 1000,
      shouldCache: (data) => data !== "Authorization failed.",
    });
    if (data === "Authorization failed.") throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getVodStreamLink = async (req, res, next) => {
  const { token } = req.body;
  const { episodeId, seriesNumber = 0 } = req.query;
  try {
    const streamUrl = `http://${portal}/stalker_portal/server/load.php?type=vod&action=create_link&cmd=/media/file_${episodeId}.mpg&series=${seriesNumber}&JsHttpRequest=1-xml`;
    const data = await portalRequest(streamUrl, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
    });
    const link = data?.js?.cmd;
    if (data === "Authorization failed.") throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: link });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getVodBySearch = async (req, res, next) => {
  const { token } = req.body;
  const { q, page } = req.query;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=vod&action=get_ordered_list&search=${q}&genre=*&p=${page}&sortby=added&JsHttpRequest=1-xml`;
    const data = await portalRequest(request, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `vod:search:${q}:${page}`,
      ttl: 2 * 60 * 1000,
      shouldCache: (data) => data !== "Authorization failed.",
    });
    if (data === "Authorization failed.") throw new Error("Authorization failed.");
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};
