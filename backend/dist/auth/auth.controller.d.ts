import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
