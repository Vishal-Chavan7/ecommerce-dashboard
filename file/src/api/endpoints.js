// API Endpoints Configuration
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/user/login',
    REGISTER: '/user/register',
    LOGOUT: '/user/logout',
    FORGOT_PASSWORD: '/user/forgot-password',
    RESET_PASSWORD: '/user/reset-password',
    VERIFY_EMAIL: '/user/verify-email',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
  },

  // Products
  PRODUCTS: {
    BASE: '/admin/products',
    BY_ID: (id) => `/admin/products/${id}`,
    SEARCH: '/admin/products/search',
  },

  // Categories
  CATEGORIES: {
    BASE: '/admin/categories',
    BY_ID: (id) => `/admin/categories/${id}`,
  },

  // Brands
  BRANDS: {
    BASE: '/admin/brands',
    BY_ID: (id) => `/admin/brands/${id}`,
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id) => `/orders/${id}`,
    UPDATE_STATUS: (id) => `/orders/${id}/status`,
    HISTORY: '/order-history',
    RETURNS: '/order-returns',
    REPLACEMENTS: '/order-replacements',
  },

  // Cart
  CART: {
    BASE: '/cart',
    BY_ID: (id) => `/cart/${id}`,
    CLEAR: '/cart/clear',
  },

  // Offers
  OFFERS: {
    COUPONS: '/admin/coupons',
    AUTO_DISCOUNTS: '/admin/auto-discounts',
    BUY_X_GET_Y: '/admin/buy-x-get-y',
    FLASH_SALES: '/admin/flash-sales',
    COMBO_OFFERS: '/admin/combo-offers',
    LOYALTY_REWARDS: '/admin/loyalty-rewards',
  },

  // Payment
  PAYMENT: {
    METHODS: '/payment-methods',
    TRANSACTIONS: '/payment-transactions',
    PARTIAL: '/partial-payments',
    WALLET: '/wallet',
    CALLBACK: '/payment-callback',
  },

  // Shipping
  SHIPPING: {
    RULES: '/shipping-rules',
    ADDRESSES: '/user-addresses',
  },

  // Settings
  SETTINGS: {
    BUSINESS: '/settings/business',
    SEO: '/settings/seo',
    EMAIL_TEMPLATES: '/settings/email-templates',
    PAYMENT_GATEWAYS: '/settings/payment-gateways',
    MOBILE_CONFIG: '/settings/mobile-config',
    CURRENCIES: '/settings/currencies',
    TAXES: '/settings/regional-taxes',
  },

  // Support
  SUPPORT: {
    CONTACT_ENQUIRIES: '/support/contact-enquiries',
    TICKETS: '/support/tickets',
    FAQS: '/admin/faqs',
  },

  // Media
  MEDIA: {
    GALLERY: '/admin/gallery',
    UPLOAD: '/admin/gallery/upload',
  },

  // Attributes & Variants
  ATTRIBUTES: '/admin/attributes',
  VARIANTS: '/admin/variants',
  TAGS: '/admin/tags',

  // Pricing
  PRICING: '/admin/pricing',
  TAX_RULES: '/admin/tax-rules',
  CURRENCY_RATES: '/admin/currency-rates',

  // Stock
  STOCK_LOGS: '/admin/stock-logs',
};

export default API_ENDPOINTS;
