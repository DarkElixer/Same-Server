export const generateToken = async () => {
  const res = await fetch(`/authenticate`);
  const data = res.json();
  return data;
};

export const getProfile = async () => {
  const res = await fetch(`/profile`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = res.json();
  return data;
};

export const getAllCategories = async (type) => {
  const res = await fetch(`/${type}/categories`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const { data, status } = await res.json();
  if (status === "fail") {
    await getProfile();
    throw new Error("Failed to fetch categories");
  }
  return data;
};

export const getAllCategoriesChannel = async (type, categoryId, page = 1) => {
  const res = await fetch(`/${type}/categories/${categoryId}?page=${page}`, {
    method: "POST",
    body: JSON.stringify({ token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const { data, status } = await res.json();
  if (
    status === "fail" ||
    data.data[0].name === "" ||
    data.data == undefined ||
    data.data.length === 0
  ) {
    await getProfile();
    throw new Error("Failed to fetch channels");
  }
  return data;
};
