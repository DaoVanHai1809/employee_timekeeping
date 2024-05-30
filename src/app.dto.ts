import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum CheckInType {
  IPS = 'IPS',
  LOCATIONS = 'LOCATIONS',
}

export class CheckInDto {
  @IsOptional()
  @Transform((e) => +e.value)
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @Transform((e) => +e.value)
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsString()
  @IsEnum(CheckInType)
  type: CheckInType;
}
