import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): any {
    console.log(
      `[REQ] ${req.method} ${req.url} ${new Date().toLocaleString('kr')}`,
    );
    next();
  }
}
