export const STORAGE_KEYS = {
  TOKEN: 'potato_token',
  LANG: 'potato_lang',
  SEASON_ID: 'potato_season_id',
} as const;

export const JWT_CLAIMS = {
  SUB: 'sub',
  EMAIL: 'email',
  NAME: 'name',
  UNIQUE_NAME: 'unique_name',
  FULL_NAME: 'FullName',
  ROLES: 'roles',
  ROLE: 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  TENANT_ID: 'tenant_id',
  TENANT_NAME: 'tenant_name',
  EXP: 'exp',
} as const;

export const APP_ROUTES = {
  AUTH_LOGIN: '/auth/login',
  FEATURES: '/features',
  FEATURES_HOME: '/features',
  FEATURES_FARMERS: '/features/farmers',
  FEATURES_FARMER_INVOICES: '/features/farmer-transactions',
  FEATURES_TRADERS: '/features/traders',
  FEATURES_TRADER_INVOICES: '/features/trader-transactions',
  FEATURES_REFRIGERATORS: '/features/refrigerators',
  FEATURES_EXPENSES: '/features/expenses',
  FEATURES_USERS: '/features/users',
  FEATURES_TENANTS: '/features/tenants',
  FEATURES_SEASONS: '/features/seasons',
  FEATURES_PROFILE: '/features/profile',
} as const;

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
} as const;
