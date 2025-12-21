import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerInteraction, CustomerInteractionType } from '../entities/customer-interaction.entity';
import { CustomerInteractionResponseDto } from '../dto/customer-interaction-response.dto';

@Injectable()
export class CustomerInteractionService {
  constructor(
    @InjectRepository(CustomerInteraction)
    private interactionRepository: Repository<CustomerInteraction>,
  ) {}

  async logOrderCreated(
    customerId: number,
    orderId: number,
    userId?: number,
  ): Promise<void> {
    const interaction = this.interactionRepository.create({
      customerId,
      userId,
      type: CustomerInteractionType.ORDER_CREATED,
      description: `Создан заказ #${orderId}`,
      metadata: { orderId },
    });

    await this.interactionRepository.save(interaction);
  }

  async logOrderDelivered(
    customerId: number,
    orderId: number,
    userId?: number,
  ): Promise<void> {
    const interaction = this.interactionRepository.create({
      customerId,
      userId,
      type: CustomerInteractionType.ORDER_DELIVERED,
      description: `Заказ #${orderId} доставлен`,
      metadata: { orderId },
    });

    await this.interactionRepository.save(interaction);
  }

  async logPaymentReceived(
    customerId: number,
    amount: number,
    userId?: number,
  ): Promise<void> {
    const interaction = this.interactionRepository.create({
      customerId,
      userId,
      type: CustomerInteractionType.PAYMENT_RECEIVED,
      description: `Получен платёж на сумму ${amount}`,
      metadata: { amount },
    });

    await this.interactionRepository.save(interaction);
  }

  async logCustomerDataUpdated(
    customerId: number,
    changes: Record<string, { old: any; new: any }>,
    userId?: number,
  ): Promise<void> {
    const descriptions: string[] = [];

    for (const [field, change] of Object.entries(changes)) {
      descriptions.push(`${field}: "${change.old}" → "${change.new}"`);
    }

    const interaction = this.interactionRepository.create({
      customerId,
      userId,
      type: CustomerInteractionType.CUSTOMER_DATA_UPDATED,
      description: `Изменены данные клиента: ${descriptions.join(', ')}`,
      metadata: { changes },
    });

    await this.interactionRepository.save(interaction);
  }

  async logArchived(customerId: number, userId?: number): Promise<void> {
    const interaction = this.interactionRepository.create({
      customerId,
      userId,
      type: CustomerInteractionType.ARCHIVED,
      description: 'Клиент архивирован',
      metadata: {},
    });

    await this.interactionRepository.save(interaction);
  }

  async logUnarchived(customerId: number, userId?: number): Promise<void> {
    const interaction = this.interactionRepository.create({
      customerId,
      userId,
      type: CustomerInteractionType.UNARCHIVED,
      description: 'Клиент восстановлен из архива',
      metadata: {},
    });

    await this.interactionRepository.save(interaction);
  }

  async findByCustomerId(
    customerId: number,
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ data: CustomerInteractionResponseDto[]; total: number }> {
    const [interactions, total] = await this.interactionRepository.findAndCount({
      where: { customerId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });

    return {
      data: interactions.map(i => this.mapToResponseDto(i)),
      total,
    };
  }

  private mapToResponseDto(
    interaction: CustomerInteraction,
  ): CustomerInteractionResponseDto {
    return new CustomerInteractionResponseDto({
      id: interaction.id,
      type: interaction.type,
      description: interaction.description,
      metadata: interaction.metadata,
      user: interaction.user
        ? {
            id: interaction.user.id,
            firstName: interaction.user.firstName,
            lastName: interaction.user.lastName,
          }
        : null,
      createdAt: interaction.createdAt,
    });
  }
}
