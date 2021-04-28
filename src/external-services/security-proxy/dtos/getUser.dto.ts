import { IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RoleDto } from './role.dto';


export class GetUserDto {


    @ApiProperty({ description: 'Id usuario' })
    id: number;

    @ApiProperty({ description: 'Nombre del usuario' })
    firstName: string;

    @ApiProperty({ description: 'Apellidos del usuario' })
    lastName: string;

    @ApiProperty({ description: 'Email del usuario' })
    email: string;

    @ApiProperty({ description: 'Descripción del usuario' })
    description: string;

    @ApiProperty({ description: 'Departamentos' })
    departments: number[];

    @ApiProperty({ description: 'Roles' })
    roles: RoleDto[];

}