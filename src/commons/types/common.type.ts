import { HttpStatus } from '@nestjs/common';

export interface SuccessRes<T> {
  message: string;
  statusCode: HttpStatus;
  data: T;
  meta?: MetaData;
}

export interface ErrorRes {
  message: string;
  statusCode: HttpStatus;
  errors?: unknown;
}

export interface MetaData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export enum SortType {
  NEW = 'new',
  TOP = 'top',
  COMMUNITY = 'community',
}
