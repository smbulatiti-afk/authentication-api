import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from './position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private readonly positions: Repository<Position>,
  ) {}

  findAll(): Promise<Position[]> {
    return this.positions.find({ order: { id: 'ASC' } });
  }

  async create(dto: CreatePositionDto): Promise<Position> {
    const positionCode = dto.positionCode.trim();
    const positionName = dto.positionName.trim();
    await this.ensureCodeAvailable(positionCode);
    const position = this.positions.create({ positionCode, positionName });

    try {
      return await this.positions.save(position);
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Position code is already in use');
      }
      throw error;
    }
  }

  async update(id: number, dto: UpdatePositionDto): Promise<Position> {
    const position = await this.positions.findOne({ where: { id } });
    if (!position) {
      throw new NotFoundException(`Position ${id} not found`);
    }

    const positionCode = dto.positionCode.trim();
    const positionName = dto.positionName.trim();
    await this.ensureCodeAvailable(positionCode, id);

    position.positionCode = positionCode;
    position.positionName = positionName;

    try {
      return await this.positions.save(position);
    } catch (error) {
      if (error?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Position code is already in use');
      }
      throw error;
    }
  }

  async remove(id: number): Promise<Position> {
    const position = await this.positions.findOne({ where: { id } });
    if (!position) {
      throw new NotFoundException(`Position ${id} not found`);
    }
    await this.positions.remove(position);
    return position;
  }

  private async ensureCodeAvailable(positionCode: string, exceptId?: number) {
    const existing = await this.positions.findOne({
      where: { positionCode },
    });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException('Position code is already in use');
    }
  }
}
