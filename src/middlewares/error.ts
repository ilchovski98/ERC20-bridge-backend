import express, {Express, Request, Response, NextFunction} from 'express';

export default function(error: any, req: Request, res: Response, next: NextFunction) {
  console.log('Handle error with middleware');

  res.status(500).send(error);
  next();
}
