const { getToken, portalFetch } = require("../services/portalSession");

function statusFor(err) {
  if (err.code === "CIRCUIT_OPEN") return 503;
  if (err.code === "AUTH_FAILED") return 502;
  if (err.code === "ECONNABORTED" || err.code === "ETIMEDOUT" || err.code === "ENOTFOUND" || err.code === "ECONNREFUSED") return 504;
  return err.response?.status || 502;
}

exports.performHandshake = async (req, res, next) => {
  console.log(`[authController] Warming server session...`);
  try {
    await getToken();
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error(`[authController] Session warm error:`, err.message, err.code || "");
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
    console.log(`[authController] Fetching profile details...`);
    const profileUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&sn=${serial}&device_id=${deviceid}&device_id2=${deviceid2}&signature=${sig}&metrics={\"mac\":\"${mac}\",\"sn\":\"${serial}\",\"model\":\"MAG254\",\"type\":\"STB\",\"uid\":\"${deviceid}\"}&JsHttpRequest=1-xml`;
    await portalFetch(profileUrl);
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.error(`[authController] Profile details error:`, err.message, err.code || "");
    res.status(statusFor(err)).json({
      status: "fail",
      message: err.message,
    });
  }
};
