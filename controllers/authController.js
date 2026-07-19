const { headers } = require("../constants/data");
const { portalRequest } = require("../services/portalClient");

const portal = process.env.portal;
const mac = process.env.mac;
const serial = process.env.serial;
const deviceid = process.env.deviceid;
const deviceid2 = process.env.deviceid2;
const sig = "";

function statusFor(err) {
  if (err.code === "CIRCUIT_OPEN") return 503;
  return err.response?.status || 503;
}

exports.performHandshake = async (req, res, next) => {
  try {
    const handshakeUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=handshake&prehash=false&JsHttpRequest=1-xml`;
    // cacheKey with no ttl: coalesces concurrent handshakes from multiple tabs, doesn't serve a stale token
    const data = await portalRequest(handshakeUrl, { headers, cacheKey: "handshake" });
    res.status(200).json({
      status: "success",
      token: data.js.token,
    });
  } catch (err) {
    res.status(statusFor(err)).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getProfileDetails = async (req, res, next) => {
  try {
    const { token } = req.body;
    const profileUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&sn=${serial}&device_id=${deviceid}&device_id2=${deviceid2}&signature=${sig}&metrics={\"mac\":\"${mac}\",\"sn\":\"${serial}\",\"model\":\"MAG254\",\"type\":\"STB\",\"uid\":\"${deviceid}\",\"random\":\"${token}\"}&JsHttpRequest=1-xml`;
    await portalRequest(profileUrl, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `profile:${token}`,
    });
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(statusFor(err)).json({
      status: "fail",
      message: err.message,
    });
  }
};
