import axios from "axios";

const runtimeEnvApiUrl =
  import.meta.env.VITE_API_URL?.trim() || "";

const rawApiUrl = runtimeEnvApiUrl;
const normalizedApiOrigin = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "")
  : "";

export const api = axios.create({
  baseURL: normalizedApiOrigin ? `${normalizedApiOrigin}/api` : "/api",
});
