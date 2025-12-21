import { CustomerInteractionType } from '../entities/customer-interaction.entity';

export class CustomerInteractionResponseDto {
  id: number;
  type: CustomerInteractionType;
  description: string;
  metadata?: Record<string, any>;
  user: {
    id: number;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: Date;

  constructor(partial: Partial<CustomerInteractionResponseDto>) {
    Object.assign(this, partial);
  }
}
