import { ConflictException, BadRequestException } from '@nestjs/common';

export const handleError = (error: any, entityName: string = 'Resource') => {
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors[0]?.path || 'field';
    throw new ConflictException(`${entityName} with ${field} already exists`);
  }

  if (error.name === 'SequelizeForeignKeyConstraintError') {
    throw new BadRequestException(`Invalid reference in ${entityName}`);
  }

  if (error.name === 'SequelizeValidationError') {
    const message = error.errors[0]?.message || 'Validation failed';
    throw new BadRequestException(message);
  }

  // Re-throw unexpected errors
  throw error;
};
