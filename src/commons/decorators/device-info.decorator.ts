import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export type DeviceInfoType = 'user-agent' | 'ip' | 'full';
export interface DeviceInfoFull {
  userAgent: string;
  ip: string;
  origin: string;
}

export const DeviceInfo = createParamDecorator(
  (data: DeviceInfoType = 'user-agent', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();

    switch (data) {
      case 'ip':
        return request.ip || request.socket.remoteAddress || 'Unknown IP';
      case 'full':
        return {
          userAgent: request.headers['user-agent'] || 'Unknown Device',
          ip: request.ip || request.socket.remoteAddress || 'Unknown IP',
          origin: request.headers.origin || 'Unknown Origin',
        };
      default: // 'user-agent'
        return request.headers['user-agent'] || 'Unknown Device';
    }
  },
);
