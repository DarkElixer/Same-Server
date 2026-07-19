const STORAGE_KEY = "continueWatching";
const MAX_ITEMS = 20;
const MIN_PROGRESS_SECONDS = 10;
const COMPLETE_THRESHOLD = 0.95;

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getContinueWatching() {
  return readAll();
}

export function getProgress(url) {
  return readAll().find((item) => item.url === url);
}

export function saveProgress({ url, position, duration, title, poster, type }) {
  if (!duration || position < MIN_PROGRESS_SECONDS) return;
  if (position / duration >= COMPLETE_THRESHOLD) {
    removeProgress(url);
    return;
  }
  const items = readAll().filter((item) => item.url !== url);
  items.unshift({ url, position, duration, title, poster, type, updatedAt: Date.now() });
  writeAll(items.slice(0, MAX_ITEMS));
}

export function removeProgress(url) {
  writeAll(readAll().filter((item) => item.url !== url));
}
