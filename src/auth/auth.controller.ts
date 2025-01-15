import { Body, Controller, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import {  } from '@nestjs/platform-express'
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { Roles } from 'src/helpers/role/roles.decorator';
import { Role } from 'src/helpers/enums';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { username: string; password: string }) {
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        return this.authService.login(user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.God, Role.Admin)
    @Post('register')
    async register(@Body() body: { firstName: string; lastName: string; username: string; password: string; role: string }) {

        return this.authService.register(body.firstName, body.lastName, body.username, body.password, body.role);

    }

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    getProtectedRoute(@Req() req) {
        return { message: `Hello ${req.user.username}, you have ${req.user.role} access!` };
    }
}
