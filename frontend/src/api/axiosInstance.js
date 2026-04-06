import axios from "axios";

const runtimeEnvApiUrl =
  import.meta.env.VITE_API_URL?.trim() ||
  import.meta.env.REACT_APP_API_URL?.trim() ||
  "";

const rawApiUrl = runtimeEnvApiUrl;
const normalizedApiOrigin = rawApiUrl
  ? rawApiUrl.replace(/\/+$/, "").replace(/\/api$/, "")
  : "";

export const api = axios.create({
  baseURL: normalizedApiOrigin ? `${normalizedApiOrigin}/api` : "/api",
});

let authInterceptor = null;

export const setApiAuthInterceptor = (getToken) => {
  if (authInterceptor !== null) {
    api.interceptors.request.eject(authInterceptor);
  }

  authInterceptor = api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (!token) return config;

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
};
