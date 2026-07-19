import { getProfile } from "./apiIptv";

export const getLiveChannelLink = async (cmd) => {
  const res = await fetch(`/live/play`, {
    method: "POST",
    body: JSON.stringify({
      cmd,
      token: localStorage.token,
    }),
    headers: {
      "Content-type": "application/json",
    },
  });
  const data = await res.json();
  if (data.status === "fail") {
    await getProfile();
    throw new Error("Failed to fetch live channel link");
  }
  return data;
};
