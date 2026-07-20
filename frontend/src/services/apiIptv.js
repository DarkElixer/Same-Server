export const generateToken = async () => {
  const res = await fetch(`/authenticate`);
  const data = await res.json();
  if (data.status === "success" && data.token) {
    localStorage.token = data.token;
  }
  return data;
};

export const fetchWithAuth = async (endpoint, bodyData = {}, retry = true) => {
  if (!localStorage.token) {
    await generateToken();
  }

  const res = await fetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ ...bodyData, token: localStorage.token }),
    headers: {
      "Content-type": "application/json",
    },
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    data = { status: "fail", message: err.message };
  }

  if ((!res.ok || data.status === "fail") && retry) {
    const authData = await generateToken();
    if (authData.status === "success") {
      return fetchWithAuth(endpoint, bodyData, false);
    }
  }

  return data;
};

export const getProfile = async () => {
  return await fetchWithAuth(`/profile`);
};

export const getAllCategories = async (type) => {
  const data = await fetchWithAuth(`/${type}/categories`);
  if (data.status === "fail" || !data.data) {
    throw new Error("Failed to fetch categories");
  }
  return data.data;
};

export const getAllCategoriesChannel = async (type, categoryId, page = 1) => {
  const data = await fetchWithAuth(`/${type}/categories/${categoryId}?page=${page}`);
  if (
    data.status === "fail" ||
    !data.data ||
    !data.data.data ||
    data.data.data.length === 0 ||
    (data.data.data[0] && data.data.data[0].name === "")
  ) {
    throw new Error("Failed to fetch channels");
  }
  return data.data;
};
