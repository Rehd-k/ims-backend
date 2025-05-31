import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string, location: string): Promise<any> {
        const user = await this.userService.findOneByUsername(username, location);
        if (!user) {
            throw new UnauthorizedException('User not found in this location');
        }
        if (user && password === user.password) {
            const { password, ...result } = user.toObject();
            return result;
        } else { throw new UnauthorizedException('Invalid password'); }

    }



    async login(user: any) {
        const payload = { username: user.username, sub: user._id, role: user.role, location: user.location };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(firstName: string, lastName: string, username: string, password: string, role: string, location: any, req: any) {
        let initiator = req.user.username;
        return await this.userService.create({ firstName, lastName, username, password, role, initiator, location });


    }
}
