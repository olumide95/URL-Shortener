import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ShortenURLRequestDTO {
  @ApiProperty() @IsUrl() @IsNotEmpty() url: string;
  @ApiProperty() @IsString() @IsNotEmpty() clientId: string;
}
