import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Tag } from 'src/models/tag.model';
import { CreateTagDto } from './dtos/create-tag.dto';
import { UpdateTagDto } from './dtos/update-tag.dto';
import { handleError } from 'src/commons/utils/error.util';
import { generateSlug } from 'src/commons/utils/format.util';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag) private readonly tagRepository: typeof Tag) {}

  async create(createTagDto: CreateTagDto) {
    try {
      return this.tagRepository.create({
        ...createTagDto,
        slug: generateSlug(createTagDto.name),
      });
    } catch (error) {
      handleError(error, 'Tag');
    }
  }

  async fineOne(id: string) {
    const tag = await this.findById(id);
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  async findById(id: string) {
    return this.tagRepository.findByPk(id);
  }

  async findOneOrCreateByName(name: string) {
    return this.tagRepository.findOrCreate({
      where: { name },
      defaults: { name, slug: generateSlug(name) },
    });
  }

  async findAll() {
    return this.tagRepository.findAll();
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    try {
      const tag = await this.fineOne(id);
      return await tag.update({
        ...updateTagDto,
        slug: generateSlug(updateTagDto.name),
      });
    } catch (error) {
      handleError(error, 'Tag');
    }
  }

  async delete(id: string) {
    const tag = await this.fineOne(id);
    await tag.destroy();
  }
}
