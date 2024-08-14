import { Injectable } from '@nestjs/common';
import Cache, { FileSystemCache } from 'file-system-cache';
import { MailService } from './utils/mail';

@Injectable()
export class AppService {
  private cache: FileSystemCache;
  private mailService: MailService;

  constructor() {
    this.cache = Cache();
    this.mailService = new MailService();
  }

  async generateShortCode(length: number = 10): Promise<string> {
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

  async shortenUrl(basePath: string, url: string): Promise<string> {
    const code = await this.generateShortCode();
    this.cache.setSync(code, url);
    const shortendURL = `${basePath}/${code}`;

    this.sendMailNotification({
      to: 'user@email.com',
      subject: 'URL Shortended Successfully',
      message: shortendURL,
    });

    return shortendURL;
  }

  async sendMailNotification({ to, subject, message }): Promise<void> {
    this.mailService.send({ to, subject, message });
  }

  getOriginalUrl(code: string): string | null {
    const originalUrl = this.cache.getSync(code);
    return originalUrl || null;
  }

  async storeMessage(clientId: string, shortenedUrl: string) {
    this.cache.setSync(clientId, shortenedUrl);
  }

  getMessage(clientId: string): string | null {
    return this.cache.getSync(clientId) || null;
  }

  async removeMessage(clientId: string) {
    await this.cache.remove(clientId);
  }
}
