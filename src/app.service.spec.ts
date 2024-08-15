import { AppService } from './app.service';

describe('AppService', () => {
  let appService: AppService;

  beforeEach(() => {
    appService = new AppService();
  });

  it('should generate a 10-character random code', async () => {
    const code = await appService.generateShortCode();
    expect(code).toHaveLength(10);
    expect(/^[A-Za-z0-9]+$/.test(code)).toBeTruthy();
  });

  it('should shorten a URL and store it', async () => {
    const baseUrl = 'http://localhost:3000';
    const originalUrl = 'test.com';
    jest
      .spyOn(appService, 'sendMailNotification')
      .mockImplementation(async () => {});

    const shortenedUrl = await appService.shortenUrl(baseUrl, originalUrl);

    const code = shortenedUrl.split('/').pop();

    expect(appService.getOriginalUrl(code)).toEqual(originalUrl);
  });
});
