import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_AUTH_KEY = 'optionalAuthApi';

export const OptionalAuthApi = () => SetMetadata(OPTIONAL_AUTH_KEY, true);
