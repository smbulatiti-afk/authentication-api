import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class CreatePositionDto {
  @IsString({ message: 'positionCode must be a string' })
  @IsNotEmpty({ message: 'positionCode is required' })
  @Matches(/\S/, { message: 'positionCode is required' })
  @MaxLength(100, { message: 'positionCode must be 100 characters or fewer' })
  positionCode: string;

  @IsString({ message: 'positionName must be a string' })
  @IsNotEmpty({ message: 'positionName is required' })
  @Matches(/\S/, { message: 'positionName is required' })
  @MaxLength(255, { message: 'positionName must be 255 characters or fewer' })
  positionName: string;
}
