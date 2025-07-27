// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/services/users.service';
import { LoginInput } from '../dto/login.input';
import { RegisterInput } from '../dto/register.input';
import { AuthResponse } from '../dto/authResponse.input';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UserService,
        private readonly jwtService: JwtService,
    ) { }

    async login(loginInput: LoginInput): Promise<AuthResponse> {
        const { username, password } = loginInput;
        const usuario = await this.usersService.findByUsername(username);
        const isPasswordValid = await bcrypt.compare(password, usuario?.password || '');

        if (!usuario || !isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload = { sub: usuario._id, name: usuario.username };
        const access_token = this.jwtService.sign(payload);

        return { access_token, usuario };
    }

    async register(registerInput: RegisterInput): Promise<User> {
        const { email, username, password } = registerInput;
        const existingUser = await this.usersService.findByUsername(username);

        if (existingUser) {
            throw new UnauthorizedException('El usuario ya existe');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await this.usersService.create({
            email,
            username,
            password: hashedPassword,
        });

        return newUser;
    }
}