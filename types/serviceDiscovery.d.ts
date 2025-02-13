declare module '@/utils/serviceDiscovery' {
  interface ServiceConfig {
    baseUrl: string;
    status: 'available' | 'unavailable';
    lastCheck: number;
    responseTime: number;
  }

  interface ServiceDiscovery {
    getServiceUrl(): Promise<string>;
    destroy(): void;
  }

  export const serviceDiscovery: ServiceDiscovery;

  export const API_ENDPOINTS: {
    health: string;
    convertImage: string;
    textBehindSubject: string;
    generateImage: string;
    [key: string]: string;
  };

  export function getApiUrl(endpoint: keyof typeof API_ENDPOINTS): Promise<string>;
} 