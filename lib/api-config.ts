/**
 * API Configuration
 * Base URL and configuration for API calls
 */

export const API_BASE_URL = 'http://localhost:8080/api';
export const OAUTH_BASE_URL = 'http://localhost:8080';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/signout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    REFRESH_TOKEN: '/auth/refresh',
    OAUTH_AZURE: '/oauth2/authorization/azure',
  },
  USER: {
    PROFILE: '/user/profile',
  },
  EMPLOYEES: {
    LIST: '/employees',
    DETAIL: '/employees',
    CREATE: '/employees',
    UPDATE: '/employees',
    DELETE: '/employees',
    REVOKE_ACCESS: '/employees',
    TOGGLE_STATUS: '/employees',
    UPDATE_CARD: '/employees',
  },
  DEPARTMENTS: {
    LIST: '/departments',
  },
  TRAININGS: {
    LIST: '/trainings',
    SESSIONS: {
      LIST: '/training-sessions',
      DETAIL: '/training-sessions',
      CREATE: '/training-sessions',
      UPDATE: '/training-sessions',
      DELETE: '/training-sessions',
    }
  },
  TRAINING_EFFECTIVENESS: {
    EVALUATIONS: '/training-effectiveness',
  },
  PUBLIC_EVALUATION: {
    GET_EVALUATION: '/public/evaluation',
    SUBMIT_EVALUATION: '/public/evaluation/submit',
  },
} as const;
