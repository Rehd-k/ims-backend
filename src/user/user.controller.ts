import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/helpers/role/roles.guard';
import { UserService } from './user.service';
import { Role } from 'src/helpers/enums';
import { Roles } from 'src/helpers/role/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }


    @Roles(Role.God, Role.Admin, Role.Manager)
    async getAllUsers() {
        return await this.userService.getAllUsers();
    }

    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    async findOneByUsername(username: string) {
        return this.userService.findOneByUsername(username);
    }


    @Roles(Role.God, Role.Admin, Role.Manager, Role.Staff, Role.Cashier)
    async getOneById(id: string) {
        return this.userService.getOneById(id);
    }

    @Roles(Role.God, Role.Admin)
    async updateOneById(id: string, user: any) {
        return this.userService.updateOneById(id, user);
    }

    @Roles(Role.God, Role.Admin)
    async deleteOneById(id: string) {
        return this.userService.deleteOneById(id);
    }
}
