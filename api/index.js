const app = require("../app");

// Vercel routes using the rewritten path (/api/live/..); Express routes expect /live/..
module.exports = (req, res) => {
  req.url = req.url.replace(/^\/api(?=\/|$)/, "") || "/";
  return app(req, res);
};
