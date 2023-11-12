import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString({
    message: 'Title은 String 타입입니다!',
  })
  title: string;

  @IsString({
    message: 'Content는 String 타입입니다!',
  })
  content: string;
}
