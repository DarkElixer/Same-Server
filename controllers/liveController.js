const axios = require("axios");
const { headers } = require("../constants/data");

const portal = process.env.portal;

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
