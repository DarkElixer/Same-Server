const axios = require("axios");
const net = require("net");
const { URL } = require("url");
const { headers: defaultHeaders } = require("../constants/data");
const { httpAgent, httpsAgent } = require("./portalClient");

function isPrivateHost(hostname) {
  if (!hostname) return true;
  if (hostname === "localhost" || hostname === "127.0.0.1") return true;
  const ip = net.isIP(hostname);
  if (ip === 4) {
    const parts = hostname.split(".").map(Number);
    if (parts[0] === 127) return true; // 127.0.0.0/8
    if (parts[0] === 10) return true; // 10.0.0.0/8
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true; // 172.16.0.0/12
    if (parts[0] === 192 && parts[1] === 168) return true; // 192.168.0.0/16
    if (parts[0] === 169 && parts[1] === 254) return true; // 169.254.0.0/16
    if (parts[0] === 0) return true;
  } else if (ip === 6) {
    if (hostname === "::1" || hostname === "0:0:0:0:0:0:0:1") return true;
    if (hostname.toLowerCase().startsWith("fe80:")) return true;
  }
  return false;
}

function parseProxyUrl(raw) {
  if (typeof raw !== "string" || !raw) return null;
  let u;
  try {
    u = new URL(decodeURIComponent(raw));
  } catch {
    return null;
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") return null;
  if (isPrivateHost(u.hostname)) return null;
  return u.href;
}

function getCleanProxyHeaders(req) {
  const clean = { ...defaultHeaders };
  if (req.headers["range"]) clean["range"] = req.headers["range"];
  if (req.headers["accept"]) clean["accept"] = req.headers["accept"];
  if (req.headers["user-agent"]) clean["user-agent"] = req.headers["user-agent"];
  return clean;
}

const ALLOWED_HEADERS = [
  "content-type",
  "content-length",
  "accept-ranges",
  "content-range",
  "last-modified",
  "etag",
];

async function proxySegment(req, res, { isLive = false } = {}) {
  const segmentUrl = parseProxyUrl(req.query.url);
  if (!segmentUrl) {
    return res.status(400).send("Invalid or blocked segment URL");
  }

  try {
    const response = await axios.get(segmentUrl, {
      headers: getCleanProxyHeaders(req),
      responseType: "stream",
      httpAgent,
      httpsAgent,
    });

    res.status(response.status);

    ALLOWED_HEADERS.forEach((h) => {
      if (response.headers[h]) {
        res.setHeader(h, response.headers[h]);
      }
    });

    if (isLive) {
      res.setHeader("Cache-Control", "no-store");
    } else {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    }

    req.on("close", () => {
      if (response.data && typeof response.data.destroy === "function") {
        response.data.destroy();
      }
    });

    response.data.on("error", (err) => {
      console.error("[streamProxy] Upstream segment stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).send("Segment proxy error");
      } else {
        res.destroy();
      }
    });

    response.data.pipe(res);
  } catch (error) {
    console.error("[streamProxy] Segment fetch error:", error.message);
    if (!res.headersSent) {
      res.status(500).send("Segment proxy error");
    } else {
      res.destroy();
    }
  }
}

async function proxyManifest(req, res, { proxyEndpoint, isTrack = false, replaceTrack = false } = {}) {
  const originalUrl = parseProxyUrl(req.query.url);
  if (!originalUrl) {
    return res.status(400).send("Invalid or blocked manifest URL");
  }

  const baseUrl = originalUrl.substring(0, originalUrl.lastIndexOf("/") + 1);

  try {
    let fetchUrl = originalUrl;
    if (replaceTrack) {
      fetchUrl = originalUrl.replace(/index.m3u8|video.m3u8/g, "tracks-v1a1/mono.m3u8");
    }

    const response = await axios.get(fetchUrl, {
      headers: getCleanProxyHeaders(req),
      responseType: "text",
      httpAgent,
      httpsAgent,
    });

    const m3u8Content = response.data;
    const rewrittenManifest = m3u8Content
      .split("\n")
      .map((line) => {
        if (line.startsWith("#") || line.trim() === "") return line;

        const cleanLine = line.split("?")[0];
        const isM3u8 = cleanLine.endsWith(".m3u8");
        const isTs = cleanLine.endsWith(".ts");

        if (isM3u8 || isTs) {
          const absoluteUrl = line.startsWith("http") ? line : new URL(line, baseUrl).href;
          let targetProxy = proxyEndpoint;

          if (isTrack && isM3u8) {
            targetProxy = "/live/proxy/track.m3u8";
          } else if (isTrack && isTs) {
            targetProxy = "/live/proxy/segment";
          }

          return `${targetProxy}?url=${encodeURIComponent(absoluteUrl)}`;
        }

        return line;
      })
      .join("\n");

    res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
    res.setHeader("Cache-Control", "no-store");
    res.send(rewrittenManifest);
  } catch (error) {
    console.error("[streamProxy] Manifest proxy error:", error.message);
    if (!res.headersSent) {
      res.status(500).send("Manifest proxy error");
    } else {
      res.destroy();
    }
  }
}

module.exports = {
  parseProxyUrl,
  proxySegment,
  proxyManifest,
};
