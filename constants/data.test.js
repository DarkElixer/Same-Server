// ponytail self-check: run with `node constants/data.test.js`
const assert = require("assert");
const { stripAdultCategories } = require("./data");

const categories = [
  { id: "1", title: "All", alias: "all" },
  { id: "2", title: "Action", alias: "action" },
  { id: "3", title: "ADULT", alias: "adult" },
  { id: "4", title: "For Adults 18+", alias: "for_adults" },
  { id: "5", title: "XXX", alias: "xxx" },
  { id: "6", title: "Documentary", alias: "docs" },
  { id: "7", title: "Erotic Movies", alias: "erotic" },
  { id: "8", title: "Comedy", alias: "adult_swim" }, // matched via alias
];

const kept = stripAdultCategories(categories).map((c) => c.id);
assert.deepStrictEqual(kept, ["1", "2", "6"], "adult categories must be filtered by title or alias");

// non-arrays pass through untouched (portal can return odd shapes)
assert.strictEqual(stripAdultCategories(undefined), undefined);
assert.strictEqual(stripAdultCategories(false), false);

// must not mutate the input — the source may be a cached response object
const original = [{ id: "1", title: "XXX" }, { id: "2", title: "Drama" }];
stripAdultCategories(original);
assert.strictEqual(original.length, 2, "input array must not be mutated");

console.log("adult category filter self-check: all assertions passed");
