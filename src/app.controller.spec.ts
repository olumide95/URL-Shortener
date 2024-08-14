import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppGateway } from './app.gateway';
import { ShortenURLRequestDTO } from './dto/shorten-url-request.dto';
import { Response } from 'express';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let appGateway: AppGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            shortenUrl: jest.fn(),
            getOriginalUrl: jest.fn(),
          },
        },
        {
          provide: AppGateway,
          useValue: {
            sendShortenedUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
    appGateway = module.get<AppGateway>(AppGateway);
  });

  describe('shortenUrl', () => {
    it('should shorten a URL and send it via WebSocket', async () => {
      const shortenUrlSpy = jest
        .spyOn(appService, 'shortenUrl')
        .mockResolvedValue('http://localhost:3000/abcde');
      const sendShortenedUrlSpy = jest.spyOn(appGateway, 'sendShortenedUrl');

      const data: ShortenURLRequestDTO = {
        url: 'https://example.com',
        clientId: '12345',
      };
      const req: any = {
        protocol: 'http',
        get: jest.fn().mockReturnValue('localhost:3000'),
      };

      await appController.shortenUrl(data, req);

      expect(shortenUrlSpy).toHaveBeenCalledWith(
        'http://localhost:3000',
        data.url,
      );
      expect(sendShortenedUrlSpy).toHaveBeenCalledWith(
        data.clientId,
        'http://localhost:3000/abcde',
      );
    });
  });

  describe('getOriginalUrl', () => {
    it('should return the original URL if found', () => {
      const originalUrl = 'https://example.com';
      jest.spyOn(appService, 'getOriginalUrl').mockReturnValue(originalUrl);

      const code = 'abcde';
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      appController.getOriginalUrl(code, res as Response);

      expect(appService.getOriginalUrl).toHaveBeenCalledWith(code);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ url: originalUrl });
    });

    it('should return 404 if the URL is not found', () => {
      jest.spyOn(appService, 'getOriginalUrl').mockReturnValue(null);

      const code = 'nonexistent';
      const res: Partial<Response> = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      appController.getOriginalUrl(code, res as Response);

      expect(appService.getOriginalUrl).toHaveBeenCalledWith(code);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'URL not found' });
    });
  });
});
