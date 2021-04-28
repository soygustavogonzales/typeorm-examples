import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TemplateTypeEnum } from '../../../shared/enums/TemplateType.enum';

export class NotificationEmailDto {
  @ApiProperty({ 
    description: 'Emails to send notification',
    examples: ['email1@gmail.com, email2@gmail.com'],
    required: true
  })
  @IsNotEmpty()
  @IsString({ each: true })
  to: string[];

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Subject of the email',
    example: '',
    required: true
  })
  subject: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Body of the email',
    example: 'Lorem ipsum....',
    required: true
  })
  body: string;

  @IsNotEmpty()
  @IsEnum(TemplateTypeEnum)
  @ApiProperty({
    description: 'template',
    example: 'Notification',
    required: true
  })
  template: TemplateTypeEnum;
}