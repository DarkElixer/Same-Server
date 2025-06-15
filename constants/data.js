const portal = process.env.portal;
const mac = process.env.mac;

exports.headers = {
  Cookie: `mac=${mac}; stb_lang=en; timezone=GMT`,
  Referer: `http://${portal}/stalker_portal/c/`,
  "User-Agent":
    "Mozilla/5.0 (QtEmbedded; U; Linux; C) AppleWebKit/533.3 (KHTML, like Gecko) MAG200 stbapp ver: 2 rev: 250 Safari/533.3",
  "X-User-Agent": "Model: MAG250; Link:",
};
