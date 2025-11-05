// Cart Session Management Utilities
// Place this in src/utils/cartSession.js

/**
 * Get or create session ID for cart
 * Session ID is stored in localStorage and persists across browser sessions
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem("cart_session_id");

  if (!sessionId) {
    // Generate unique session ID
    sessionId =
      "session_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("cart_session_id", sessionId);
    console.log("New cart session created:", sessionId);
  }

  return sessionId;
};

/**
 * Get user ID from localStorage/auth
 * Returns null if user is not logged in
 */
export const getUserId = () => {
  return localStorage.getItem("user_id") || null;
};

/**
 * Set user ID (call after login)
 */
export const setUserId = (userId) => {
  if (userId) {
    localStorage.setItem("user_id", userId);
  } else {
    localStorage.removeItem("user_id");
  }
};

/**
 * Clear session (for testing purposes)
 */
export const clearCartSession = () => {
  localStorage.removeItem("cart_session_id");
  console.log("Cart session cleared");
};

/**
 * Get cart identifier object for API calls
 */
export const getCartIdentifier = () => {
  return {
    sessionId: getSessionId(),
    ...(getUserId() && { userId: getUserId() }),
  };
};
