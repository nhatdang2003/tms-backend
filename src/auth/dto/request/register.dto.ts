import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator'

export class RegisterDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'User email address',
    })
    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email cannot be empty' })
    @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
    email: string

    @ApiProperty({
        example: 'John',
        description: 'User first name',
    })
    @IsString({ message: 'First name must be a string' })
    @IsNotEmpty({ message: 'First name cannot be empty' })
    @MaxLength(100, { message: 'First name cannot exceed 100 characters' })
    @Matches(/^[a-zA-ZÀ-ỹ\s]*$/, { message: 'First name can only contain letters and spaces' })
    firstName: string

    @ApiProperty({
        example: 'Doe',
        description: 'User last name',
    })
    @IsString({ message: 'Last name must be a string' })
    @IsNotEmpty({ message: 'Last name cannot be empty' })
    @MaxLength(100, { message: 'Last name cannot exceed 100 characters' })
    @Matches(/^[a-zA-ZÀ-ỹ\s]*$/, { message: 'Last name can only contain letters and spaces' })
    lastName: string

    @ApiProperty({
        example: 'StrongPassword123!',
        description: 'User password (Min 8 characters, must include letters, numbers, and special characters)',
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password cannot be empty' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(100, { message: 'Password cannot exceed 100 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string
}
