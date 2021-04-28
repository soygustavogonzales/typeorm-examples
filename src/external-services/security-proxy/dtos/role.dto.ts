import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class RoleDto {


    @ApiProperty({ description: 'Id rol' })
    id: number;

    @ApiProperty({ description: 'Nombre' })
    name: string;

}