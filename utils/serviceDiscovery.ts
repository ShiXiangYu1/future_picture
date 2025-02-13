interface ServiceConfig {
  baseUrl: string;
  status: 'available' | 'unavailable';
  lastCheck: number;
  responseTime: number;
}

class ServiceDiscovery {
  private static instance: ServiceDiscovery;
  private serviceConfig: ServiceConfig | null = null;
  private checkInterval: number = 30000; // 30秒检查一次
  private retryTimeout: number = 5000;  // 5秒后重试
  private checkTimer: NodeJS.Timeout | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.startHealthCheck();
    }
  }

  public static getInstance(): ServiceDiscovery {
    if (!ServiceDiscovery.instance) {
      ServiceDiscovery.instance = new ServiceDiscovery();
    }
    return ServiceDiscovery.instance;
  }

  private async checkHealth(url: string): Promise<ServiceConfig> {
    const startTime = Date.now();
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Health check failed');
      }

      const responseTime = Date.now() - startTime;
      return {
        baseUrl: url,
        status: 'available',
        lastCheck: Date.now(),
        responseTime,
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        baseUrl: url,
        status: 'unavailable',
        lastCheck: Date.now(),
        responseTime: Date.now() - startTime,
      };
    }
  }

  private async discoverService(): Promise<ServiceConfig> {
    const urls = [
      process.env.NEXT_PUBLIC_PRIMARY_URL || 'http://localhost:3000',
      process.env.NEXT_PUBLIC_SECONDARY_URL || 'http://localhost:3001',
    ];

    for (const url of urls) {
      const config = await this.checkHealth(url);
      if (config.status === 'available') {
        return config;
      }
    }

    // 如果所有服务都不可用，返回第一个地址并标记为不可用
    return {
      baseUrl: urls[0],
      status: 'unavailable',
      lastCheck: Date.now(),
      responseTime: 0,
    };
  }

  private startHealthCheck() {
    this.checkTimer = setInterval(async () => {
      if (this.serviceConfig) {
        const config = await this.checkHealth(this.serviceConfig.baseUrl);
        if (config.status === 'unavailable') {
          // 如果当前服务不可用，尝试发现新的服务
          this.serviceConfig = await this.discoverService();
        } else {
          this.serviceConfig = config;
        }
      }
    }, this.checkInterval);
  }

  public async getServiceUrl(): Promise<string> {
    if (!this.serviceConfig || this.serviceConfig.status === 'unavailable') {
      this.serviceConfig = await this.discoverService();
    }
    return this.serviceConfig.baseUrl;
  }

  public destroy() {
    if (this.checkTimer) {
      clearInterval(this.checkTimer);
      this.checkTimer = null;
    }
  }
}

export const serviceDiscovery = ServiceDiscovery.getInstance();

// API 端点
export const API_ENDPOINTS = {
  health: '/api/health',
  convertImage: '/api/convert',
  textBehindSubject: '/api/text-behind-subject',
  generateImage: '/api/generate-image',
  // ... 其他 API 端点
};

// 构建完整的 API URL
export async function getApiUrl(endpoint: keyof typeof API_ENDPOINTS): Promise<string> {
  const baseUrl = await serviceDiscovery.getServiceUrl();
  return `${baseUrl}${API_ENDPOINTS[endpoint]}`;
} 