import { Injectable } from '@nestjs/common';
import Cache, { FileSystemCache } from 'file-system-cache';
import { MailService } from './utils/mail';
import { ONE_YEAR_IN_SECONDS } from './utils/constants';

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

    this.cache.setSync(code, url, ONE_YEAR_IN_SECONDS);

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
    const originalUrl = this.cache.getSync(code, null);
    return originalUrl;
  }

  storeMessage(clientId: string, message: string): void {
    const messages: string[] | null = this.cache.getSync(clientId, null);
    if (messages) {
      const messageExist = messages.includes(message);
      if (messageExist) {
        return;
      }

      messages.push(message);
      this.cache.setSync(clientId, messages);
      return;
    }

    this.cache.setSync(clientId, [message]);
  }

  getMessages(clientId: string): string[] | null {
    return this.cache.getSync(clientId, null);
  }

  async removeMessage(clientId: string, message: string) {
    let messages: string[] | null = this.cache.getSync(clientId, null);
    if (messages?.length > 1) {
      messages = messages.filter((item) => item !== message);
      this.cache.setSync(clientId, messages);
      return;
    }

    await this.cache.remove(clientId);
  }
}
