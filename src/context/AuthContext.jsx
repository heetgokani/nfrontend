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
    setProductsLoading(true);
    try {
      const res = await axios.get(
        "https://nbackend-31lg.onrender.com/api/products"
      );
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Validate session on app initialization
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
            logout();
          } else {
            const user = userStr !== "null" ? JSON.parse(userStr) : null;

            if (!user) {
              logout();
              return;
            }

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

  // Fetch product listings on assembly mounting
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

  // 🛡️ GLOBAL REQUEST AND RESPONSE INTERCEPTORS ENGINE
  useEffect(() => {
    // Request Interceptor: Automatically bundles token headers to keep iOS authenticated
    const requestInterceptor = axios.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    // Response Interceptor: Catches session expiry triggers securely
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && [401, 403].includes(error.response.status)) {
          logout();
          // Returning an unfulfilled promise payload safely prevents application core layouts from crashing
          return new Promise(() => {});
        }
        return Promise.reject(error);
      }
    );

    // Unmount cleanup logic to avoid interceptor layering leaks
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
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
