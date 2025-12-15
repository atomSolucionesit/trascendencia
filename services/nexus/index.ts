import axios from "axios";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const apiKey = process.env.NEXT_PUBLIC_API_KEY;

if (!apiUrl) {
  throw new Error("NEXUS_API_URL is not configured");
}

export const api = axios.create({
  baseURL: apiUrl.replace(/\/$/, ""),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers.Authorization = `Bearer ${apiKey}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});
