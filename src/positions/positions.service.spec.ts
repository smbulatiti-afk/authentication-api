import { ConflictException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Position } from './position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { PositionsService } from './positions.service';

describe('PositionsService', () => {
  let repository: {
    find: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
  };
  let service: PositionsService;

  beforeEach(() => {
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    service = new PositionsService(repository as any);
  });

  it('lists positions', async () => {
    const positions = [{ id: 1, positionCode: 'MGR', positionName: 'Manager' }];
    repository.find.mockResolvedValue(positions);

    await expect(service.findAll()).resolves.toEqual(positions);
    expect(repository.find).toHaveBeenCalledWith({ order: { id: 'ASC' } });
  });

  it('creates a position and trims values', async () => {
    repository.findOne.mockResolvedValue(null);
    repository.create.mockImplementation((value) => value);
    repository.save.mockImplementation(async (position) => ({
      id: 1,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      ...position,
    }));

    await expect(
      service.create({ positionCode: ' MGR ', positionName: ' Manager ' }),
    ).resolves.toMatchObject({
      id: 1,
      positionCode: 'MGR',
      positionName: 'Manager',
    });
  });

  it('rejects duplicate position codes', async () => {
    repository.findOne.mockResolvedValue({
      id: 2,
      positionCode: 'MGR',
      positionName: 'Existing',
    });

    await expect(
      service.create({ positionCode: 'MGR', positionName: 'Manager' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates an existing position', async () => {
    const position = {
      id: 1,
      positionCode: 'MGR',
      positionName: 'Manager',
    } as Position;
    repository.findOne
      .mockResolvedValueOnce(position)
      .mockResolvedValueOnce(null);
    repository.save.mockImplementation(async (value) => value);

    await expect(
      service.update(1, { positionCode: 'DIR', positionName: 'Director' }),
    ).resolves.toMatchObject({
      id: 1,
      positionCode: 'DIR',
      positionName: 'Director',
    });
  });

  it('returns not-found when updating or deleting unknown IDs', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.update(999, { positionCode: 'MGR', positionName: 'Manager' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('deletes an existing position', async () => {
    const position = { id: 1, positionCode: 'MGR', positionName: 'Manager' } as Position;
    repository.findOne.mockResolvedValue(position);
    repository.remove.mockResolvedValue(position);

    await expect(service.remove(1)).resolves.toBe(position);
  });

  it('validates required and string position fields', async () => {
    const missing = await validate(plainToInstance(CreatePositionDto, {}));
    expect(missing.map((error) => error.property)).toEqual(
      expect.arrayContaining(['positionCode', 'positionName']),
    );

    const invalidTypes = await validate(
      plainToInstance(CreatePositionDto, {
        positionCode: 123,
        positionName: false,
      }),
    );
    expect(invalidTypes.map((error) => error.property)).toEqual(
      expect.arrayContaining(['positionCode', 'positionName']),
    );
  });
});
