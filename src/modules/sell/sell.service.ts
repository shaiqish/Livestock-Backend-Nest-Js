import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateSellDto } from './dto/create-sell.dto';
import { UpdateSellDto } from './dto/update-sell.dto';
import { Sell } from './entities/sell.entity';
import { Livestock } from '../livestock/entities/livestock.entity';
import { Contact } from '../contact/entities/contact.entity';

@Injectable()
export class SellService {
  private readonly logger = new Logger(SellService.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(
    createSellDto: CreateSellDto,
    livestockId: string,
  ): Promise<Sell> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const livestock = await queryRunner.manager.findOne(Livestock, {
        where: { id: livestockId },
      });
      if (!livestock) {
        throw new NotFoundException(
          `Livestock with ID ${livestockId} not found`,
        );
      }

      // Find or create buyer contact
      let buyerContact = await queryRunner.manager.findOne(Contact, {
        where: { email: createSellDto.buyerEmail },
      });
      if (!buyerContact) {
        buyerContact = queryRunner.manager.create(Contact, {
          fullName: createSellDto.buyerName,
          email: createSellDto.buyerEmail,
          phoneNumber: createSellDto.buyerPhoneNumber,
          province: createSellDto.buyerState,
          district: createSellDto.buyerCity,
          postalCode: createSellDto.buyerZipCode,
          designation: createSellDto.buyerDesignation,
        });
        buyerContact = await queryRunner.manager.save(Contact, buyerContact);
      }

      // Find or create point of contact
      let contactPerson = await queryRunner.manager.findOne(Contact, {
        where: { email: createSellDto.contactEmail },
      });
      if (!contactPerson) {
        contactPerson = queryRunner.manager.create(Contact, {
          fullName: createSellDto.contactName,
          phoneNumber: createSellDto.contactPhoneNumber,
          email: createSellDto.contactEmail,
          address: createSellDto.contactAddress,
          role: createSellDto.contactRole,
        });
        contactPerson = await queryRunner.manager.save(Contact, contactPerson);
      }

      const sell = queryRunner.manager.create(Sell, {
        price: createSellDto.price,
        paymentMethod: createSellDto.paymentMethod,
        dateOfSale: createSellDto.dateOfSale,
        depositAmount: createSellDto.depositAmount,
        balanceDue: createSellDto.balanceDue,
        zipCode: createSellDto.zipCode,
        termsAndConditions: createSellDto.termsAndConditions,
        buyerInfo: buyerContact,
        pointOfContactInfo: contactPerson,
        livestock,
      });
      const savedSell = await queryRunner.manager.save(Sell, sell);
      await queryRunner.commitTransaction();
      return savedSell;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Failed to create sell record',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create sell record');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Sell[]> {
    return this.dataSource.getRepository(Sell).find({
      relations: ['buyerInfo', 'pointOfContactInfo', 'livestock'],
    });
  }

  async findOne(id: string): Promise<Sell> {
    const sell = await this.dataSource.getRepository(Sell).findOne({
      where: { id },
      relations: ['buyerInfo', 'pointOfContactInfo', 'livestock'],
    });
    if (!sell) {
      throw new NotFoundException(`Sell with id ${id} not found`);
    }
    return sell;
  }

  async update(id: string, updateSellDto: UpdateSellDto): Promise<Sell> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sell = await queryRunner.manager.findOne(Sell, {
        where: { id },
      });
      if (!sell) {
        throw new NotFoundException(`Sell with id ${id} not found`);
      }
      const updated = queryRunner.manager.merge(Sell, sell, updateSellDto);
      const saved = await queryRunner.manager.save(Sell, updated);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to update sell id ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update sell');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const sell = await queryRunner.manager.findOne(Sell, {
        where: { id },
      });
      if (!sell) {
        throw new NotFoundException(`Sell with id ${id} not found`);
      }
      await queryRunner.manager.remove(Sell, sell);
      await queryRunner.commitTransaction();
      return { deleted: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Failed to delete sell id ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete sell');
    } finally {
      await queryRunner.release();
    }
  }
}
