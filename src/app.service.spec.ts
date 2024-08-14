import { AppService } from './app.service';

describe('AppService', () => {
  let urlService: AppService;

  beforeEach(() => {
    urlService = new AppService();
  });

  it('should generate a 10-character random code', () => {
    const code = urlService.generateShortCode();
    expect(code).toHaveLength(10);
    expect(/^[A-Za-z0-9]+$/.test(code)).toBeTruthy();
  });

  it('should shorten a URL and store it', () => {
    const baseUrl = 'http://localhost:3000';
    const originalUrl = 'test.com';
    const shortenedUrl = urlService.shortenUrl(baseUrl, originalUrl);

    const code = shortenedUrl.split('/').pop();
    expect(urlService.getOriginalUrl(code)).toEqual(originalUrl);
  });
});
