import { wait } from "../util/helper";
import { getProfile, host } from "./apiIptv";

export const getLiveChannelLink = async (cmd, attempt = 1) => {
  if (attempt >= 3) return;
  const res = await fetch(`${host}/live/play`, {
    method: "POST",
    body: JSON.stringify({
      cmd,
      token: localStorage.token,
    }),
    headers: {
      "Content-type": "application/json",
      Referer: "http://jiotv.be/stalker_portal/c/",
    },
  });
  const data = await res.json();
  if (data.status === "fail") {
    await wait(1);
    await getProfile();
    return getLiveChannelLink(cmd, attempt + 1);
  }
  return data;
};
