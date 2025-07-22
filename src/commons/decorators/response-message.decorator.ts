import { SetMetadata } from '@nestjs/common';

export const RESPONSE_MESSAGE_KEY = 'RESPONSE_MESSAGE';
export const ResponseMessage = (msg: string) =>
  SetMetadata(RESPONSE_MESSAGE_KEY, msg);
