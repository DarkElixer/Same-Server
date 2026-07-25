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

// Proxy segment for live streams
exports.proxySegment = async (req, res) => {
  return streamProxySegment(req, res, { isLive: true });
};

// Proxy the master playlist - rewrites variant playlist URLs
exports.proxyMasterPlaylist = async (req, res) => {
  return proxyManifest(req, res, { proxyEndpoint: "/live/proxy/track.m3u8", isTrack: true });
};

// Proxy the track/variant playlist - rewrites segment URLs
exports.proxyTrackPlaylist = async (req, res) => {
  return proxyManifest(req, res, { proxyEndpoint: "/live/proxy/segment" });
};

exports.getLiveStream = async (req, res, next) => {
  const { cmd } = req.body;
  try {
    const streamUrl = `http://${portal}/stalker_portal/server/load.php?type=itv&action=create_link&cmd=${cmd}&JsHttpRequest=1-xml`;
    const data = await portalFetch(streamUrl);
    const link = data?.js?.cmd;
    if (!link) {
      throw new Error("Live stream link missing in portal response");
    }
    res.status(200).json({ status: "success", data: link });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=itv&action=get_genres&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: "live:genres",
      ttl: CACHE_TTL.genres,
    });
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};

exports.getCategoriesChannel = async (req, res, next) => {
  const { page = 1 } = req.query;
  const { id } = req.params;
  try {
    const request = `http://${portal}/stalker_portal/server/load.php?type=itv&action=get_ordered_list&genre=${id}&force_ch_link_check=&p=${page}&JsHttpRequest=1-xml`;
    const data = await portalFetch(request, {
      cacheKey: `live:channels:${id}:${page}`,
      ttl: CACHE_TTL.listings,
    });
    res.status(200).json({ status: "success", data: data.js });
  } catch (err) {
    console.error(err.message);
    res.status(statusFor(err)).json({ status: "fail", message: err.message });
  }
};
