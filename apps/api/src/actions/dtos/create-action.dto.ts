import { IsString, IsNotEmpty } from 'class-validator';

export class CreateActionDto {
  @IsString()
  @IsNotEmpty()
  action: string;
}
