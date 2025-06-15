const axios = require("axios");
const { headers } = require("../constants/data");

const portal = process.env.portal;
const mac = process.env.mac;
const serial = process.env.serial;
const deviceid = process.env.deviceid;
const deviceid2 = process.env.deviceid;
const sig = "";

exports.performHandshake = async (req, res, next) => {
  try {
    const handshakeUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=handshake&prehash=false&JsHttpRequest=1-xml`;
    const response = await axios(handshakeUrl, {
      headers: {
        ...headers,
        "X-Forwarded-For": req.ip,
      },
    });
    res.status(200).json({
      status: "success",
      token: response.data.js.token,
    });
  } catch (err) {
    res.status(429).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getProfileDetails = async (req, res, next) => {
  try {
    const { token } = req.body;
    const profileUrl = `http://${portal}/stalker_portal/server/load.php?type=stb&action=get_profile&hd=1&sn=${serial}&device_id=${deviceid}&device_id2=${deviceid2}&signature=${sig}&metrics={\"mac\":\"${mac}\",\"sn\":\"${serial}\",\"model\":\"MAG254\",\"type\":\"STB\",\"uid\":\"${deviceid}\",\"random\":\"${token}\"}&JsHttpRequest=1-xml`;
    await axios(profileUrl, {
      headers: {
        ...headers,
        "X-Forwarded-For": req.ip,
        Authorization: `Bearer ${token}`,
      },
    });
    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    res.status(429).json({
      status: "fail",
      message: err.message,
    });
  }
};
