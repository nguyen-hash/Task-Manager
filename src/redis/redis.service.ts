import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error("REDIS_URL is not defined in environment variables");
    }

    const isTls = url.startsWith('rediss://');
    this.client = new Redis(url, isTls ? { tls: {} } : {});
  }

  async get<T = any>(key: string): Promise<T | null> {
    const result = await this.client.get(key);
    return result ? JSON.parse(result) : null;
  }

  async set(key: string, value: any, ttlSeconds = 60): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
