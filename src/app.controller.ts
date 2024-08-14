import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import { AppGateway } from './app.gateway';
import { ShortenURLRequestDTO } from './dto/shorten-url-request.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('URL Shortner')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appGateway: AppGateway,
  ) {}

  @Post('url')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Shorten a valid URL' })
  @ApiResponse({ status: 202, description: 'Processing.' })
  async shortenUrl(@Body() data: ShortenURLRequestDTO, @Req() req: any) {
    const baseUrl = `${req.protocol}://${req.get('Host')}`;
    const shortenedUrl = await this.appService.shortenUrl(baseUrl, data.url);

    this.appGateway.sendShortenedUrl(data.clientId, shortenedUrl);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Retrieve original URL' })
  getOriginalUrl(@Param('code') code: string, @Res() res: Response) {
    const originalUrl = this.appService.getOriginalUrl(code);
    if (originalUrl) {
      res.status(200).json({ url: originalUrl });
    } else {
      res.status(404).json({ message: 'URL not found' });
    }
  }
}
