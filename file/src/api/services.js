import api from "./axios";

// Auth Services (User)
export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post("/user/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post("/user/register", userData);
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

// Admin Auth Services
export const adminAuthService = {
  // Admin Login
  login: async (email, password) => {
    const response = await api.post("/admin/auth/login", { email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Admin Register
  register: async (adminData) => {
    const response = await api.post("/admin/auth/register", adminData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Get Admin Profile
  getProfile: async () => {
    const response = await api.get("/admin/auth/profile");
    return response.data;
  },

  // Update Admin Profile
  updateProfile: async (profileData) => {
    const response = await api.put("/admin/auth/profile", profileData);
    return response.data;
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put("/admin/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  // Admin Logout
  logout: async () => {
    try {
      await api.post("/admin/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current admin
  getCurrentAdmin: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if admin is authenticated
  isAuthenticated: () => {
    const user = localStorage.getItem("user");
    if (!user) return false;

    try {
      const parsedUser = JSON.parse(user);
      return !!localStorage.getItem("token") && parsedUser.role === "admin";
    } catch {
      return false;
    }
  },
};

// Product Services
export const productService = {
  getAllProducts: async (params) => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData) => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// Order Services
export const orderService = {
  getAllOrders: async (params) => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  createOrder: async (orderData) => {
    const response = await api.post("/orders", orderData);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },
};

// Cart Services
export const cartService = {
  getCart: async () => {
    const response = await api.get("/cart");
    return response.data;
  },

  addToCart: async (productId, quantity) => {
    const response = await api.post("/cart", { productId, quantity });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete("/cart");
    return response.data;
  },
};

// User Services
export const userService = {
  getProfile: async () => {
    const response = await api.get("/users/profile");
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put("/users/profile", userData);
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await api.get("/users", { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Settings Services
export const settingsService = {
  getBusinessSettings: async () => {
    const response = await api.get("/settings/business");
    return response.data;
  },

  updateBusinessSettings: async (data) => {
    const response = await api.put("/settings/business", data);
    return response.data;
  },

  getSeoSettings: async () => {
    const response = await api.get("/settings/seo");
    return response.data;
  },

  getPaymentGateways: async () => {
    const response = await api.get("/settings/payment-gateways");
    return response.data;
  },
};

// Offer Services
export const offerService = {
  getAllOffers: async (params) => {
    const response = await api.get("/offers", { params });
    return response.data;
  },

  getOfferById: async (id) => {
    const response = await api.get(`/offers/${id}`);
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await api.post("/offers", offerData);
    return response.data;
  },

  updateOffer: async (id, offerData) => {
    const response = await api.put(`/offers/${id}`, offerData);
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await api.delete(`/offers/${id}`);
    return response.data;
  },
};

export default api;
