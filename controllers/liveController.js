const axios = require("axios");
const { URL } = require("url");
const { headers } = require("../constants/data");

const portal = process.env.portal;

// Proxy segment for live streams
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
    console.error("Live segment proxy error:", error);
    res.status(500).send("Live segment proxy error");
  }
};

// Proxy the master playlist - rewrites variant playlist URLs
exports.proxyMasterPlaylist = async (req, res) => {
  try {
    const originalUrl = decodeURIComponent(req.query.url);

    // Find base URL
    let lastIndex = originalUrl.lastIndexOf("/");
    const baseUrl = originalUrl.substring(0, lastIndex + 1);

    // Fetch the master playlist
    const response = await axios.get(originalUrl, {
      headers: req.headers,
      responseType: "text",
    });

    const m3u8Content = response.data;

    // Rewrite variant playlist URLs to point to our track proxy
    const rewrittenManifest = m3u8Content
      .split("\n")
      .map((line) => {
        // Skip comments and empty lines
        if (line.startsWith("#") || line.trim() === "") return line;

        // Handle variant playlist lines (.m3u8)
        if (line.split("?")[0].endsWith(".m3u8")) {
          // Convert relative URLs to absolute
          const playlistUrl = line.startsWith("http")
            ? line
            : new URL(line, baseUrl).href;

          // Point to our track playlist proxy endpoint
          return `/live/proxy/track.m3u8?url=${encodeURIComponent(
            playlistUrl
          )}`;
        }
        return line;
      })
      .join("\n");

    res.header("Content-Type", "application/vnd.apple.mpegurl");
    res.send(rewrittenManifest);
  } catch (error) {
    console.error("Live master proxy error:", error);
    res.status(500).send("Live master proxy error");
  }
};

// Proxy the track/variant playlist - rewrites segment URLs
exports.proxyTrackPlaylist = async (req, res) => {
  try {
    const originalUrl = decodeURIComponent(req.query.url);

    // Find base URL
    let lastIndex = originalUrl.lastIndexOf("/");
    const baseUrl = originalUrl.substring(0, lastIndex + 1);

    // Fetch the track playlist
    const response = await axios.get(originalUrl, {
      headers: req.headers,
      responseType: "text",
    });

    const m3u8Content = response.data;

    // Rewrite segment URLs to point to our proxy
    const rewrittenManifest = m3u8Content
      .split("\n")
      .map((line) => {
        // Skip comments and empty lines
        if (line.startsWith("#") || line.trim() === "") return line;

        // Handle segment lines (.ts)
        if (line.split("?")[0].endsWith(".ts")) {
          // Convert relative URLs to absolute
          const segmentUrl = line.startsWith("http")
            ? line
            : new URL(line, baseUrl).href;

          // Point to our segment proxy endpoint
          return `/live/proxy/segment?url=${encodeURIComponent(segmentUrl)}`;
        }
        return line;
      })
      .join("\n");

    res.header("Content-Type", "application/vnd.apple.mpegurl");
    res.send(rewrittenManifest);
  } catch (error) {
    console.error("Live track proxy error:", error);
    res.status(500).send("Live track proxy error");
  }
};

exports.getLiveStream = async (req, res, next) => {
  const { token, cmd } = req.body;
  try {
    const streamUrl = `http://${portal}/stalker_portal/server/load.php?type=itv&action=create_link&cmd=${cmd}&JsHttpRequest=1-xml`;
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

exports.getCategories = async (req, res, next) => {
  const { token } = req.body;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=itv&action=get_genres&JsHttpRequest=1-xml`;
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

// exports.getAllChannels = async (req, res, next) => {
//   const { token } = req.body;
//   headers2 = {
//     ...headers,
//     Authorization: `Bearer ${token}`,
//   };
//   try {
//     const request = `http://${portal}/stalker_portal/server/load.php?type=itv&action=get_all_channels&JsHttpRequest=1-xml`;
//     const response = await axios(request, {
//       headers: headers2,
//     });
//     if (response.data === "Authorization failed.")
//       throw new Error("Authorization failed.");
//     res.status(200).json({ status: "success", data: response.data.js });
//   } catch (err) {
//     res.status(401).json({ status: "fail", message: err.message });
//   }
// };

exports.getCategoriesChannel = async (req, res, next) => {
  const { token } = req.body;
  const { page = 1 } = req.query;
  const { id } = req.params;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=itv&action=get_ordered_list&genre=${id}&force_ch_link_check=&p=${page}&JsHttpRequest=1-xml`;
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
    console.error(err.message);
    res.status(401).json({ status: "fail", message: err.message });
  }
};
