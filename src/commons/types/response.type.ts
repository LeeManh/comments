import { HttpStatus } from '@nestjs/common';

export interface SuccessRes<T> {
  message: string;
  statusCode: HttpStatus;
  data: T;
}

export interface ErrorRes {
  message: string;
  statusCode: HttpStatus;
  errors?: unknown;
}
