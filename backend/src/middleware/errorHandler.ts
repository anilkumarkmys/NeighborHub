import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err.stack);
  const status = (err as { status?: number }).status || 500;
  res.status(status).json({ message: err.message || 'Internal server error' });
}
