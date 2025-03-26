import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateBankDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    accountNumber?: string;

    @IsNumber()
    @IsOptional()
    balance?: string;
}