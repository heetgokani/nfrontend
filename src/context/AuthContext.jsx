import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import axios from "axios";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);

  const logout = () => {
    setAuth(null);
    setProducts([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setLoading(false);
    window.location.href = "/login";
  };

  const fetchProducts = useCallback(async () => {
    // If you want this to run even for guests (like an eCommerce site usually does),
    // we don't strictly require auth.token here.
    setProductsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      // Note: Your backend /api/products doesn't populate variants by default.
      // If you updated your backend to return variants here, this will store them perfectly.
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr && userStr !== "undefined") {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const currentTime = Date.now() / 1000;

          if (payload.exp && payload.exp < currentTime) {
            // Token is expired on page load, silently logout
            logout();
          } else {
            const user = JSON.parse(userStr);
            setAuth({
              token,
              user,
              role: user.role || null,
              rolename: user.role?.rolename || "",
            });
          }
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Fetch products on mount regardless of auth so shop works for guests
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const login = (userData, token) => {
    setAuth({
      token,
      user: userData,
      role: userData.role || null,
      rolename: userData.role?.rolename || "",
    });
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
          logout();
          // 🛡️ THE SILENT FIX:
          // Returning an empty promise freezes the error here.
          // It stops your UI components from crashing or showing toasts while the page redirects.
          return new Promise(() => {});
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        auth,
        user: auth?.user || null,
        token: auth?.token || null,
        loading,
        products,
        productsLoading,
        fetchProducts,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
