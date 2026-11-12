import { IsString, Length, Matches, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(3, 100)
  @Matches(/^[a-zA-Z0-9_.-]+$/, {
    message: 'Username may contain letters, numbers, underscores, dots, and hyphens only',
  })
  username: string;

  @IsString()
  @Length(8, 72)
  @MaxLength(72)
  password: string;
}
