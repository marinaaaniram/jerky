import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
export declare class RolesService {
    private rolesRepository;
    constructor(rolesRepository: Repository<Role>);
    findAll(): Promise<Role[]>;
    findOne(id: number): Promise<Role | null>;
    findByName(name: string): Promise<Role | null>;
}
