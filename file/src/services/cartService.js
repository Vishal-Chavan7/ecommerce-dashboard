// Cart API Service
// Place this in src/services/cartService.js

import api from "../api/axios";
import { getSessionId, getUserId } from "../utils/cartSession";

/**
 * Add item to cart
 */
export const addToCart = async (productId, variantId = null, quantity = 1) => {
  try {
    const response = await api.post("/cart", {
      userId: getUserId(),
      sessionId: getSessionId(),
      productId,
      variantId,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

/**
 * Get cart items
 */
export const getCart = async () => {
  try {
    const params = {
      sessionId: getSessionId(),
      ...(getUserId() && { userId: getUserId() }),
    };

    const response = await api.get("/cart", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

/**
 * Update item quantity
 */
export const updateCartItemQuantity = async (
  productId,
  variantId,
  quantity
) => {
  try {
    const response = await api.put("/cart/update-quantity", {
      userId: getUserId(),
      sessionId: getSessionId(),
      productId,
      variantId: variantId || null,
      quantity,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating quantity:", error);
    throw error;
  }
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (productId, variantId = null) => {
  try {
    const response = await api.delete("/cart/item", {
      data: {
        userId: getUserId(),
        sessionId: getSessionId(),
        productId,
        variantId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error removing from cart:", error);
    throw error;
  }
};

/**
 * Clear entire cart
 */
export const clearCart = async () => {
  try {
    const response = await api.post("/cart/clear", {
      userId: getUserId(),
      sessionId: getSessionId(),
    });
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};

/**
 * Merge guest cart with user cart (call after login)
 */
export const mergeCartsOnLogin = async (userId) => {
  try {
    const response = await api.post("/cart/merge", {
      userId,
      sessionId: getSessionId(),
    });
    return response.data;
  } catch (error) {
    console.error("Error merging carts:", error);
    throw error;
  }
};

/**
 * Apply coupon code
 */
export const applyCoupon = async (couponCode) => {
  try {
    const response = await api.post("/cart/apply-coupon", {
      userId: getUserId(),
      sessionId: getSessionId(),
      couponCode,
    });
    return response.data;
  } catch (error) {
    console.error("Error applying coupon:", error);
    throw error;
  }
};

/**
 * Remove coupon
 */
export const removeCoupon = async () => {
  try {
    const response = await api.post("/cart/remove-coupon", {
      userId: getUserId(),
      sessionId: getSessionId(),
    });
    return response.data;
  } catch (error) {
    console.error("Error removing coupon:", error);
    throw error;
  }
};

/**
 * Get cart item count (for header badge)
 */
export const getCartItemCount = async () => {
  try {
    const cartData = await getCart();
    const items = cartData.data?.items || [];
    return items.reduce((total, item) => total + item.quantity, 0);
  } catch (error) {
    return 0;
  }
};
