import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(
    createContactDto: CreateContactDto,
  ): Promise<{ message: string; data: Contact }> {
    const contact = this.contactRepository.create(createContactDto);
    const savedContact = await this.contactRepository.save(contact);

    return {
      message: 'Contact created successfully',
      data: savedContact,
    };
  }

  async findAll(
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
    const [contacts, total] = await this.contactRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: ['buyerSells', 'pointOfContactSells'],
    });

    return {
      message: 'Contacts retrieved successfully',
      data: contacts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<{ message: string; data: Contact }> {
    const contact = await this.contactRepository.findOne({
      where: { id },
      relations: ['sells'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    return {
      message: 'Contact retrieved successfully',
      data: contact,
    };
  }

  async update(
    id: string,
    updateContactDto: UpdateContactDto,
  ): Promise<{ message: string; data: Contact }> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    const updatedContact = await this.contactRepository.save({
      ...contact,
      ...updateContactDto,
    });

    return {
      message: 'Contact updated successfully',
      data: updatedContact,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const contact = await this.contactRepository.findOne({ where: { id } });

    if (!contact) {
      throw new NotFoundException(`Contact with ID ${id} not found`);
    }

    await this.contactRepository.remove(contact);

    return {
      message: 'Contact deleted successfully',
    };
  }
}
