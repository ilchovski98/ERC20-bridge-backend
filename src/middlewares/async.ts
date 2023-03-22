import express, {Express, Request, Response, NextFunction} from 'express';

// Todo fix type any
export function asyncMiddleware(handler: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res);
    } catch (error) {
      next(error);
    }
  }
}
