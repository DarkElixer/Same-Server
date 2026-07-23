const { headers } = require("../constants/data");
const { portalRequest } = require("../services/portalClient");

function statusFor(err) {
  if (err.code === "CIRCUIT_OPEN") return 503;
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") return 504;
  return err.response?.status || 503;
}

exports.performHandshake = async (req, res, next) => {
  const portal = process.env.portal;
  const mac = process.env.mac;
  const serial = process.env.serial;
  const deviceid = process.env.deviceid;
  const deviceid2 = process.env.deviceid2;
  const sig = "";

  console.log(`[authController] Starting performHandshake for portal: ${portal}`);
  try {
    const handshakeUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=handshake&prehash=false&JsHttpRequest=1-xml`;
    console.log(`[authController] Requesting handshake URL: ${handshakeUrl}`);
    const data = await portalRequest(handshakeUrl, { headers, cacheKey: "handshake" });
    console.log(`[authController] Handshake raw response:`, typeof data === "object" ? JSON.stringify(data).substring(0, 300) : data);

    if (!data || !data.js || !data.js.token) {
      console.error(`[authController] Handshake failed: missing token in response`, data);
      return res.status(502).json({
        status: "fail",
        message: typeof data === "string" ? data : "Invalid handshake response from portal",
      });
    }

    const token = data.js.token;
    console.log(`[authController] Handshake succeeded. Token acquired: ${token}. Activating token via profile API...`);

    const profileUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&sn=${serial}&device_id=${deviceid}&device_id2=${deviceid2}&signature=${sig}&metrics={\"mac\":\"${mac}\",\"sn\":\"${serial}\",\"model\":\"MAG254\",\"type\":\"STB\",\"uid\":\"${deviceid}\",\"random\":\"${token}\"}&JsHttpRequest=1-xml`;
    await portalRequest(profileUrl, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `profile:${token}`,
    });
    console.log(`[authController] Profile API called successfully. Token activated.`);

    res.status(200).json({
      status: "success",
      token: token,
    });
  } catch (err) {
    console.error(`[authController] Handshake / Profile error:`, err.message, err.code || "");
    res.status(statusFor(err)).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getProfileDetails = async (req, res, next) => {
  const portal = process.env.portal;
  const mac = process.env.mac;
  const serial = process.env.serial;
  const deviceid = process.env.deviceid;
  const deviceid2 = process.env.deviceid2;
  const sig = "";

  try {
    const { token } = req.body;
    console.log(`[authController] Getting profile details for portal: ${portal}`);
    const profileUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&sn=${serial}&device_id=${deviceid}&device_id2=${deviceid2}&signature=${sig}&metrics={\"mac\":\"${mac}\",\"sn\":\"${serial}\",\"model\":\"MAG254\",\"type\":\"STB\",\"uid\":\"${deviceid}\",\"random\":\"${token}\"}&JsHttpRequest=1-xml`;
    await portalRequest(profileUrl, {
      headers: { ...headers, Authorization: `Bearer ${token}` },
      cacheKey: `profile:${token}`,
    });
    console.log(`[authController] Profile details acquired successfully.`);
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error(`[authController] Profile error:`, err.message, err.code || "");
    res.status(statusFor(err)).json({
      status: "fail",
      message: err.message,
    });
  }
};
