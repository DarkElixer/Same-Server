export const wait = async function (time) {
  return new Promise((res) => {
    setTimeout(res, time * 1000);
  });
};

export function replaceSpecialChars(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
}

export function getLiveCmdURL(str) {
  return str.split("/").pop();
}

export function getOrignalNmae(str) {
  return str.slice(0, str.lastIndexOf("-")).toUpperCase().replaceAll("-", " ");
}

export function preLen(screenshots) {
  const firstPart = Math.ceil(+screenshots / 100);
  return `${firstPart}/${screenshots}.jpg`;
}
