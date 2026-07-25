const CACHE_TTL = {
  categories: 4 * 60 * 60 * 1000, // 4 hours
  genres: 4 * 60 * 60 * 1000,     // 4 hours
  listings: 30 * 60 * 1000,       // 30 min
  search: 10 * 60 * 1000,         // 10 min
};

module.exports = { CACHE_TTL };
