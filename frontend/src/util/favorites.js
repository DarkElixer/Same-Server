const STORAGE_KEY = "favorites";

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

export function getFavorites() {
  return readAll();
}

export function isFavorite(id) {
  return readAll().some((item) => item.id === id);
}

export function toggleFavorite(item) {
  const items = readAll();
  const exists = items.some((f) => f.id === item.id);
  if (exists) {
    writeAll(items.filter((f) => f.id !== item.id));
    return false;
  }
  writeAll([{ ...item, addedAt: Date.now() }, ...items]);
  return true;
}

export function removeFavorite(id) {
  writeAll(readAll().filter((item) => item.id !== id));
}
