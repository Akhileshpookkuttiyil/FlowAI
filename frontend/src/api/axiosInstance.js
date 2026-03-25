import axios from "axios";

const rawApiUrl = process.env.REACT_APP_API_URL?.trim();
const normalizedApiOrigin = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "")
  : "";

export const api = axios.create({
  baseURL: normalizedApiOrigin ? `${normalizedApiOrigin}/api` : "/api",
});
