import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findOneByUsername(username);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }
        if (user && password === user.password) {
            const { password, ...result } = user.toObject();
            return result;
        } else { throw new UnauthorizedException('Invalid password'); }
      
    }



    async login(user: any) {
        console.log('got here for some reasons')
        const payload = { username: user.username, sub: user._id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(firstName: string, lastName: string, username: string, password: string, role: string, initiator: string) {

        return await this.userService.create({ firstName, lastName, username, password, role, initiator });


    }
}
