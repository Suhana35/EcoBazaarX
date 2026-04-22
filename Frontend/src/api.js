import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    /**
     * Handle both 401 and 403 as "session expired / not authenticated":
     *
     * - 401 Unauthorized  — no token or token rejected by the JWT filter.
     * - 403 Forbidden     — Spring Security 6 + @PreAuthorize("isAuthenticated()")
     *   throws AccessDeniedException (not AuthenticationException) for expired /
     *   invalid tokens, which the framework maps to 403 instead of 401.
     *
     * In both cases the stored token is invalid, so we clear it and send the
     * user back to the login page. We skip the redirect for the /auth/signin and
     * /auth/signup endpoints so a wrong-password attempt doesn't bounce the page.
     */
    const isAuthEndpoint =
      error.config?.url?.includes("/auth/signin") ||
      error.config?.url?.includes("/auth/signup");

    if ((status === 401 || status === 403) && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("guestCart");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/**
 * Fetch smart recommendations for a product.
 * Returns products of the same type with a similar carbon footprint,
 * ordered by eco-score (greener first).
 *
 * @param {number} productId  - ID of the source product
 * @param {number} [limit=4]  - Max number of recommendations to return
 */
export const getRecommendations = (productId, limit = 4) =>
  API.get(`/products/${productId}/recommendations`, { params: { limit } });

export default API;