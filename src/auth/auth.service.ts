import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenPayload } from 'src/commons/types/token.type';
import { comparePassword } from 'src/commons/utils/hash.util';
import { User } from 'src/models/user.model';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dtos/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await comparePassword(password, user.password))) return user;
    return null;
  }

  async login(user: User) {
    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      accessToken,
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.usersService.create(registerUserDto);

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(tokenPayload);

    return {
      accessToken,
    };
  }
}
