import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';
import { Filter } from 'src/common/interfaces/Filter.interface';
import { applyFilters } from 'src/common/functions/applyFilters';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<{ message: string; data: Contact }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contact = this.contactRepository.create(createContactDto);
      const savedContact = await queryRunner.manager.save(Contact, contact);
      await queryRunner.commitTransaction();

      return {
        message: 'Contact created successfully',
        data: savedContact,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        'Failed to create contact',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to create contact');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    filters: Filter[],
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    message: string;
    data: Contact[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const qb = this.contactRepository.createQueryBuilder('contact');
      qb.leftJoinAndSelect(
        'contact.buyerSells',
        'buyerSells',
      ).leftJoinAndSelect('contact.pointOfContactSells', 'pointOfContactSells');

      const filteredQb = applyFilters(
        qb,
        filters,
        this.dataSource,
        'contact',
        Contact,
      );

      const [items, total] = await filteredQb
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('contact.createdAt', 'DESC')
        .getManyAndCount();

      return {
        message: 'Contacts retrieved successfully',
        data: items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(
        'Failed to retrieve contacts',
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve contacts');
    }
  }

  async findOne(id: string): Promise<{ message: string; data: Contact }> {
    try {
      const contact = await this.contactRepository.findOne({
        where: { id },
        relations: ['buyerSells', 'pointOfContactSells'],
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      return {
        message: 'Contact retrieved successfully',
        data: contact,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to retrieve contact ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to retrieve contact');
    }
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<{ message: string; data: Contact }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contact = await queryRunner.manager.findOne(Contact, {
        where: { id },
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      const updatedContact = await queryRunner.manager.save(Contact, {
        ...contact,
        ...updateContactDto,
      });

      await queryRunner.commitTransaction();

      return {
        message: 'Contact updated successfully',
        data: updatedContact,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update contact ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to update contact');
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contact = await queryRunner.manager.findOne(Contact, {
        where: { id },
      });

      if (!contact) {
        throw new NotFoundException(`Contact with ID ${id} not found`);
      }

      await queryRunner.manager.remove(Contact, contact);
      await queryRunner.commitTransaction();

      return {
        message: 'Contact deleted successfully',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete contact ${id}`,
        error instanceof Error ? error.stack : error,
      );
      throw new InternalServerErrorException('Failed to delete contact');
    } finally {
      await queryRunner.release();
    }
  }
}
