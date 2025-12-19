import { Role } from '../../roles/entities/role.entity';
export declare class User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: number;
    role: Role;
    createdAt: Date;
    updatedAt: Date;
}
