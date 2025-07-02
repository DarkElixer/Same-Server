const axios = require("axios");
const { Parser } = require("m3u8-parser");
const { URL } = require("url");
const { headers } = require("../constants/data");

const portal = process.env.portal;
let lastIndex = -1;
exports.proxySegment = async (req, res) => {
  try {
    const segmentUrl = decodeURIComponent(req.query.url);
    // Fetch the segment with axios using stream response
    const response = await axios.get(segmentUrl, {
      headers: req.headers,
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
      "index.m3u8",
      "tracks-v1a1/mono.m3u8"
    );
    const response = await axios.get(changedUrlToTrack, {
      headers: { ...req.headers, Host: new URL(originalUrl).hostname },
      responseType: "text",
    });

    const m3u8Content = response.data;
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
