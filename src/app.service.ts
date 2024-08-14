import { Injectable } from '@nestjs/common';
import Cache, { FileSystemCache } from 'file-system-cache';

@Injectable()
export class AppService {
  private cache: FileSystemCache;
  constructor() {
    this.cache = Cache();
  }

  generateShortCode(length: number = 10): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  shortenUrl(basePath: string, url: string): string {
    const code = this.generateShortCode();
    this.cache.setSync(code, url);
    return `${basePath}/${code}`;
  }

  getOriginalUrl(code: string): string | null {
    const originalUrl = this.cache.getSync(code);
    return originalUrl || null;
  }
}
