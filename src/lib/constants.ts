// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  ACCESS_TOKEN_EXPIRES: 5 * 60 * 1000, // 5 minutes
  REFRESH_TOKEN_EXPIRES: 7 * 24 * 60 * 60 * 1000, // 7 days
  DEBOUNCE_DELAY: 300, // 300ms
  RETRY_DELAY_BASE: 1000, // 1 second
  RETRY_DELAY_MAX: 30000, // 30 seconds
  TOAST_DURATION: 4000, // 4 seconds
} as const;

// API constants
export const API_CONSTANTS = {
  MAX_RETRY_ATTEMPTS: 3,
  TIMEOUT: 10000, // 10 seconds
  RATE_LIMIT_DELAY: 1000, // 1 second
} as const;

// UI constants
export const UI_CONSTANTS = {
  SKELETON_COUNT: 6, // Default skeleton count for loading states
  PAGINATION_SIZE: 20, // Default page size
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
  OTP_LENGTH: 6,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Route constants
export const ROUTE_CONSTANTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  DASHBOARD: "/",
  PROFILE: "/profile",
  SETTINGS: "/settings",
} as const;

// Environment constants
export const ENV_CONSTANTS = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test",
} as const;

// Error codes
export const ERROR_CODES = {
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
  SERVER_ERROR: "SERVER_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;
