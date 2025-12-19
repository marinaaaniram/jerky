import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private usersRepository;
    private jwtService;
    constructor(usersRepository: Repository<User>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../roles/entities/role.entity").Role;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../roles/entities/role.entity").Role;
        };
    }>;
    validateUser(email: string, password: string): Promise<User | null>;
    private generateToken;
}
