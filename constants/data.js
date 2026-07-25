const portal = process.env.portal;
const mac = process.env.mac;

exports.headers = {
  Cookie: `mac=${mac}; stb_lang=en; timezone=GMT`,
};

// Categories hidden from every listing. Override with a comma-separated
// ADULT_CATEGORY_TERMS env var if the portal uses different wording.
const ADULT_TERMS = (process.env.ADULT_CATEGORY_TERMS || "adult,xxx,porn,erotic,18+,sex")
  .split(",")
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

function isAdultCategory(category) {
  if (!category) return false;
  const haystack = `${category.title || ""} ${category.alias || ""}`.toLowerCase();
  return ADULT_TERMS.some((term) => haystack.includes(term));
}

// Returns a new array — never mutates, since the input may be a cached response.
exports.stripAdultCategories = (categories) =>
  Array.isArray(categories) ? categories.filter((c) => !isAdultCategory(c)) : categories;
