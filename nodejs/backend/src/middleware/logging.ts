import { Request, Response, NextFunction } from 'express';

export function logRequests(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    console.log(
      JSON.stringify({
        level: 'info',
        method: req.method,
        path: req.path,
        status: res.statusCode,
        elapsedMs: Math.round(elapsedMs * 100) / 100,
        msg: 'request handled',
      }),
    );
  });

  next();
}
