const portal = process.env.portal;
const mac = process.env.mac;

exports.headers = {
  Cookie: `mac=${mac}; stb_lang=en; timezone=GMT`,
};
