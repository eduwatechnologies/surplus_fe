import axios from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// 1️⃣ Axios instance for normal requests
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// 2️⃣ Flag to prevent multiple refresh requests
let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

// 3️⃣ Helpers for queuing requests while refreshing
function onRefreshed(token: string) {
  subscribers.forEach((cb) => cb(token));
  subscribers = [];
}

function addSubscriber(callback: (token: string) => void) {
  subscribers.push(callback);
}

// 4️⃣ Request interceptor: attach access token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("userToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 5️⃣ Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const message = error.response?.data?.error;

    // 🔹 1. Handle token expired
    if (status === 401 && message === "Token expired" && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve) => {
          addSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        // Use plain axios to avoid interceptor loop
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });

        const newAccessToken = data.accessToken;
        localStorage.setItem("userToken", newAccessToken);

        // Update default header for future requests
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry queued requests
        onRefreshed(newAccessToken);

        return axiosInstance(originalRequest);
      } catch (err: any) {
        console.error("Token refresh failed:", err.response?.data?.error || err.message);
        localStorage.clear();
        window.location.href = "/auth/signin";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 🔹 2. Handle "logged in on another device"
    if (status === 401 && message === "Logged in on another device") {
      try {
        // Use plain axios to avoid interceptor loop
        await axios.post(`${API_URL}/auth/logout`);
      } catch (logoutErr) {
        console.error("Backend logout failed:", logoutErr);
      } finally {
        localStorage.clear();
        window.location.href = "/auth/signin";
      }
    }

    // 🔹 3. All other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
