import { wait } from "../util/helper";

export const host = "http://localhost:3152";

export const generateToken = async () => {
  const res = await fetch(`${host}/authenticate`);
  const data = res.json();
  return data;
};

export const getProfile = async () => {
  const res = await fetch(`${host}/profile`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = res.json();
  return data;
};

export const getAllCategories = async (type, attempt = 1) => {
  if (attempt >= 3) return;
  const res = await fetch(`${host}/${type}/categories`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const { data, status } = await res.json();
  if (status === "fail") {
    await wait(1);
    await getProfile();
    return getAllCategories(type, attempt + 1);
  }
  return data;
};

export const getAllCategoriesChannel = async (
  type,
  categoryId,
  page = 1,
  attempt = 1
) => {
  if (attempt >= 3) return;
  const res = await fetch(
    `${host}/${type}/categories/${categoryId}?page=${page}`,
    {
      method: "POST",
      body: JSON.stringify({ token: localStorage.token }),
      headers: {
        "Content-type": "application/json",
      },
    }
  );
  const { data, status } = await res.json();
  if (
    status === "fail" ||
    data.data[0].name === "" ||
    data.data == undefined ||
    data.data.length === 0
  ) {
    await wait(2);
    await getProfile();
    return getAllCategoriesChannel(type, categoryId, page, attempt + 1);
  }
  return data;
};
