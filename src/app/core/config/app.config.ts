export interface AppConfig {
  apiUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  environment: 'development' | 'production';
}

export const APP_CONFIG: AppConfig = {
  apiUrl: '/api',
  apiTimeout: 30000,
  enableLogging: true,
  environment: 'development'
};
