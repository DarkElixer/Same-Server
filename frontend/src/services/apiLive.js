import { fetchWithAuth } from "./apiIptv";

export const getLiveChannelLink = async (cmd) => {
  const data = await fetchWithAuth(`/live/play`, { cmd });
  if (data.status === "fail") {
    throw new Error("Failed to fetch live channel link");
  }
  return data;
};
